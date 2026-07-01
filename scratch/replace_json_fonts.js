const fs = require('fs');
const path = require('path');

const dirs = [
  '/Users/naeladvertising/Desktop/Website Development/Donnabella/templates',
  '/Users/naeladvertising/Desktop/Website Development/Donnabella/config',
  '/Users/naeladvertising/Desktop/Website Development/Donnabella/sections'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(file => file.endsWith('.json'));

  files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Replace font settings strings
    content = content.replace(/Playfair Display/g, "Cormorant Garamond");
    content = content.replace(/Merriweather/g, "Montserrat");

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated JSON fonts in: ${dir.split('/').pop()}/${file}`);
    }
  });
});
