const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = '/Users/naeladvertising/Desktop/Website Development/Donnabella/templates';

const files = fs.readdirSync(TEMPLATES_DIR).filter(file => file.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(TEMPLATES_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Remove Google Fonts links (handling standard tags and unicode escapes like \u003c)
  content = content.replace(/(?:\\u003c|<)link[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*(?:\\u003e|>)/gi, '');
  // Also clean up loose links with escaped quotes
  content = content.replace(/(?:\\u003c|<)link[^>]*fonts\.(?:googleapis|gstatic)\.com[^\\]*\\"[^>]*(?:\\u003e|>)/gi, '');

  // 2. Replace Jost with Montserrat
  content = content.replace(/--sans\s*:\s*['"]Jost['"],\s*sans-serif;?/gi, "--sans: 'Montserrat', sans-serif;");
  content = content.replace(/font-family\s*:\s*var\(--sans\)\s*;/gi, "font-family: var(--sans);");
  content = content.replace(/font-family\s*:\s*['"]Jost['"],\s*sans-serif;?/gi, "font-family: 'Montserrat', sans-serif;");

  // If changes were made, write back
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned custom liquid fonts in: templates/${file}`);
  }
});
