const fs = require('fs');
const path = require('path');

// Get all template directories
const templateDirs = fs.readdirSync('./templates');

console.log('Building templates:', templateDirs);

templateDirs.forEach(dir => {
  console.log(`\nProcessing template: ${dir}`);
  
  try {
    const scriptPath = path.join('./templates', dir, 'script.js');
    const scriptContent = fs.existsSync(scriptPath) 
      ? fs.readFileSync(scriptPath, 'utf8') 
      : '';
    
    // Create build directory if it doesn't exist
    const buildDir = path.join('./build', dir);
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }
    
    // Process front template
    const frontPath = path.join('./templates', dir, 'front.html');
    if (fs.existsSync(frontPath)) {
      const frontContent = fs.readFileSync(frontPath, 'utf8');
      const frontCombined = scriptContent 
        ? `${frontContent}\n<script>\n${scriptContent}\n</script>` 
        : frontContent;
      fs.writeFileSync(path.join(buildDir, 'front.js'), frontCombined);
      console.log(`Built ${dir}/front.js`);
    }
    
    // Process back template
    const backPath = path.join('./templates', dir, 'back.html');
    if (fs.existsSync(backPath)) {
      const backContent = fs.readFileSync(backPath, 'utf8');
      const backCombined = scriptContent 
        ? `${backContent}\n<script>\n${scriptContent}\n</script>` 
        : backContent;
      fs.writeFileSync(path.join(buildDir, 'back.js'), backCombined);
      console.log(`Built ${dir}/back.js`);
    }
    
  } catch (error) {
    console.error(`Error processing ${dir}: ${error.message}`);
  }
});