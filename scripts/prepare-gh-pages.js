// scripts/prepare-gh-pages.js
const fs = require('fs');
const path = require('path');

// Crear archivo .nojekyll para evitar procesamiento Jekyll
const outDir = path.join(__dirname, '../out');
fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

// Copiar el archivo index.html a 404.html para manejar rutas SPA
fs.copyFileSync(
  path.join(outDir, 'index.html'),
  path.join(outDir, '404.html')
);

console.log('Preparación para GitHub Pages completada');