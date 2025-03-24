const fs = require('fs');
const path = require('path');

// Get all template directories
const templateDirs = fs.readdirSync('./templates');

console.log('Building templates:', templateDirs);

templateDirs.forEach(dir => {
  console.log(`\nProcessing template: ${dir}`);
  
  try {
    // Create build directory if it doesn't exist
    const buildDir = path.join('./build', dir);
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }
    
    // Process front template
    const frontHtmlPath = path.join('./templates', dir, 'front.html');
    const frontJsPath = path.join('./src', dir, 'front.js');
    
    if (fs.existsSync(frontHtmlPath) && fs.existsSync(frontJsPath)) {
      const frontHtmlContent = fs.readFileSync(frontHtmlPath, 'utf8');
      const frontJsContent = fs.readFileSync(frontJsPath, 'utf8');
      
      const frontCombined = `${frontHtmlContent}\n<script>\n${frontJsContent}\n</script>`;
      fs.writeFileSync(path.join(buildDir, 'front.js'), frontCombined);
      console.log(`Built ${dir}/front.js`);
    } else {
      console.log(`Missing files for front template. HTML: ${fs.existsSync(frontHtmlPath)}, JS: ${fs.existsSync(frontJsPath)}`);
    }
    
    // Process back template
    const backHtmlPath = path.join('./templates', dir, 'back.html');
    const backJsPath = path.join('./src', dir, 'back.js');
    
    if (fs.existsSync(backHtmlPath) && fs.existsSync(backJsPath)) {
      const backHtmlContent = fs.readFileSync(backHtmlPath, 'utf8');
      const backJsContent = fs.readFileSync(backJsPath, 'utf8');
      
      const backCombined = `${backHtmlContent}\n<script>\n${backJsContent}\n</script>`;
      fs.writeFileSync(path.join(buildDir, 'back.js'), backCombined);
      console.log(`Built ${dir}/back.js`);
    } else {
      console.log(`Missing files for back template. HTML: ${fs.existsSync(backHtmlPath)}, JS: ${fs.existsSync(backJsPath)}`);
    }
  } catch (error) {
    console.error(`Error processing ${dir}: ${error.message}`);
  }
});