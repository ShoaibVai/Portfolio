const fs = require('fs');
const path = require('path');
let terser;
try {
  terser = require('terser');
} catch (e) {
  console.error('Terser is not installed. Please run `npm install` to install dev dependencies and try again.');
  process.exit(1);
}

(async () => {
  const dir = path.join(__dirname, '..', 'js');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && !f.endsWith('.min.js'));
  for (const file of files) {
    try {
      const filePath = path.join(dir, file);
      const code = fs.readFileSync(filePath, 'utf8');
      const res = await terser.minify(code, {compress: true, mangle: true});
      const outPath = path.join(dir, file.replace('.js', '.min.js'));
      fs.writeFileSync(outPath, res.code, 'utf8');
      console.log('Minified:', file, '->', path.basename(outPath));
    } catch (e) {
      console.error('Error minifying', file, e);
    }
  }
})();
