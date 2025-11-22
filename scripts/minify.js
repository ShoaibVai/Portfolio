const fs = require('fs');
const path = require('path');
let terser;
let csso;
try {
  terser = require('terser');
  csso = require('csso');
} catch (e) {
  console.error('Dependencies are not installed. Please run `npm install` to install dev dependencies and try again.');
  process.exit(1);
}

(async () => {
  const jsDir = path.join(__dirname, '..', 'js');
  const cssDir = path.join(__dirname, '..', 'css');
  const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js') && !f.endsWith('.min.js'));
  for (const file of files) {
    try {
  const filePath = path.join(jsDir, file);
      const code = fs.readFileSync(filePath, 'utf8');
      const res = await terser.minify(code, {compress: true, mangle: true});
  const outPath = path.join(jsDir, file.replace('.js', '.min.js'));
      fs.writeFileSync(outPath, res.code, 'utf8');
      console.log('Minified:', file, '->', path.basename(outPath));
    } catch (e) {
      console.error('Error minifying', file, e);
    }
  }

  // Minify CSS files in css/ -> css/*.min.css
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css') && !f.endsWith('.min.css'));
    for (const file of cssFiles) {
      try {
        const filePath = path.join(cssDir, file);
        const cssCode = fs.readFileSync(filePath, 'utf8');
        const res = csso.minify(cssCode, {forceMediaMerge: false});
        const outPath = path.join(cssDir, file.replace('.css', '.min.css'));
        fs.writeFileSync(outPath, res.css, 'utf8');
        console.log('Minified CSS:', file, '->', path.basename(outPath));
      } catch (e) {
        console.error('Error minifying css', file, e);
      }
    }
  }
})();
