const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'ui.html');
const jsPath = path.join(__dirname, 'ui.js');
const outPath = path.join(__dirname, 'dist/ui.distribution.html');

let html = fs.readFileSync(htmlPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');

// Replace the script tag with inlined JS
html = html.replace(
  /<script\s+src=["'][^"']*ui\.js["']><\/script>/,
  `<script>\n${js}\n</script>`
);

fs.writeFileSync(outPath, html, 'utf8');
console.log('Inlined ui.js into ui.distribution.html');
