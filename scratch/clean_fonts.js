const fs = require('fs');
const path = require('path');

const SECTIONS_DIR = '/Users/naeladvertising/Desktop/Website Development/Donnabella/sections';

const files = fs.readdirSync(SECTIONS_DIR).filter(file => file.endsWith('.liquid'));

files.forEach(file => {
  const filePath = path.join(SECTIONS_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Remove Google Fonts preconnect/link tags
  content = content.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/gi, '');
  content = content.replace(/<link[^>]*fonts\.gstatic\.com[^>]*>/gi, '');
  content = content.replace(/<link[^>]*family=\{\{[^>]*\}\}[^>]*>/gi, '');

  // 2. Remove Google Fonts CSS imports inside <style>
  content = content.replace(/@import\s+url\(['"]https:\/\/fonts\.googleapis\.com[^'"]+['"]\);?/gi, '');

  // 3. Update --sans: 'Jost' to --sans: 'Montserrat'
  content = content.replace(/--sans\s*:\s*['"]Jost['"],\s*sans-serif;?/g, "--sans: 'Montserrat', sans-serif;");
  content = content.replace(/--sans\s*:\s*['"]Jost['"]\s*;/g, "--sans: 'Montserrat';");

  // 4. Update --arabic: 'Cairo' to --arabic: 'Tajawal' (to distinguish body from display)
  content = content.replace(/--arabic\s*:\s*['"]Cairo['"],\s*sans-serif;?/g, "--arabic: 'Tajawal', sans-serif;");

  // 5. Update --font-display: var(--arabic) to 'Cairo' for Arabic headings
  content = content.replace(
    /--font-display\s*:\s*\{\%\s*if\s*is_arabic\s*\%\}\s*var\(--arabic\)\s*\{\%\s*else\s*\%\}\s*var\(--serif\)\s*\{\%\s*endif\s*\%\}\s*;/g,
    "--font-display: {% if is_arabic %}'Cairo', sans-serif{% else %}var(--serif){% endif %};"
  );

  // If changes were made, write back
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated fonts in: ${file}`);
  }
});
