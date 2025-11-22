const _lighthouse = require('lighthouse');
const lighthouse = _lighthouse.default || _lighthouse;
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function runLighthouse(url, opts = {}, config = null) {
  const chromePath = process.env.CHROME_PATH;
  if (!chromePath) {
    throw new Error('CHROME_PATH environment variable not set. Please set to Chromium/Chrome executable path.');
  }

  const chrome = await chromeLauncher.launch({
    executablePath: chromePath,
    chromeFlags: [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--ignore-certificate-errors',
      '--allow-insecure-localhost',
      '--disable-web-security',
      '--disable-site-isolation-trials',
      '--disable-extensions',
      '--no-first-run'
    ]
  });
  opts.port = chrome.port;

  try {
    const runnerResult = await lighthouse(url, opts, config);
    return runnerResult;
  } finally {
    await chrome.kill();
  }
}

async function main() {
  const workspaceRoot = path.resolve(__dirname, '..');
  const reportsDir = path.resolve(workspaceRoot, 'lighthouse-reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

  // Try to start a simple static server so Lighthouse always has a running origin to use
  const http = require('http');
  const mime = require('mime-types');

  function createStaticServer(rootDir) {
    const server = http.createServer((req, res) => {
      // Normalize URL
      let target = req.url.split('?')[0].replace(/\/+$/, '');
      // If root or empty, serve index
      if (!target || target === '') target = '/index.html';
      // Make sure leading slash
      if (!target.startsWith('/')) target = '/' + target;
      // Resolve to disk
      const filePath = path.join(rootDir, target);
      fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
          // If not a file, try serving index.html for SPA-style paths
          const indexFile = path.join(rootDir, 'index.html');
          if (fs.existsSync(indexFile)) {
            const stream = fs.createReadStream(indexFile);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            stream.pipe(res);
            return;
          }
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found');
          return;
        }
        const contentType = mime.lookup(filePath) || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
      });
    });
    return server;
  }

  const server = createStaticServer(workspaceRoot);
  // Listen on 127.0.0.1:8080, or fallback to a free port
  const listenPort = 8080;
  await new Promise((resolve, reject) => {
    server.on('error', (e) => {
      // If port in use, try ephemeral port
      if (e.code === 'EADDRINUSE') {
        server.listen(0, '127.0.0.1', () => resolve());
      } else {
        reject(e);
      }
    });
    server.listen(listenPort, '127.0.0.1', () => resolve());
  });
  const actualPort = server.address().port;
  console.log(`Serving ${workspaceRoot} at http://127.0.0.1:${actualPort}`);

  const pages = [
    { name: 'index', url: `http://127.0.0.1:${actualPort}/index.html`, emulated: 'mobile' },
    { name: 'projects', url: `http://127.0.0.1:${actualPort}/projects.html`, emulated: 'mobile' },
    { name: 'achievements', url: `http://127.0.0.1:${actualPort}/achievements.html`, emulated: 'mobile' },
    { name: 'blogs', url: `http://127.0.0.1:${actualPort}/blogs.html`, emulated: 'mobile' }
  ];

  for (const p of pages) {
    console.log(`Running Lighthouse for ${p.name} -> ${p.url}`);
    const opts = {
      emulatedFormFactor: p.emulated || 'mobile',
      output: 'html',
      onlyCategories: ['performance','accessibility','best-practices','seo'],
      logLevel: 'info'
    };
    try {
      const runnerResult = await runLighthouse(p.url, opts);
      const html = runnerResult.report;
      const filename = path.join(reportsDir, `${p.name}-report.html`);
      fs.writeFileSync(filename, html);
      console.log(`Saved report: ${filename}`);
    } catch (error) {
      console.error(`Failed to run Lighthouse for ${p.name}:`, error.message || error);
    }
  }

  // Close HTTP server
  await new Promise((resolve) => server.close(() => resolve()));
  console.log('Static server closed.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
