# Anki Template Project Restructuring Plan

I'll help you restructure your Anki card templates repository to separate HTML templates from JavaScript code, making it easier to test the JS functionality while maintaining compatibility with Anki.

## Current Structure
- Multiple template directories at the top level (e.g., `order-of-operations/`)
- Each template has `front.js` and `back.js` containing both HTML and JS

## Proposed Directory Structure
```
/AnkiCardTemplates/
  /templates/           # HTML templates with Anki syntax
    /template-1/
      front.html
      back.html
      script.js        # JS functions used by both templates
    /template-2/
      ...
  /src/                # Clean JS modules for testing
    /template-1/
      index.js         # Exports functions from script.js
    /template-2/
      ...
  /tests/              # Test files
    /template-1/
      script.test.js
    /template-2/
      ...
  /build/              # Combined files ready for Anki
    /template-1/
      front.js
      back.js
    /template-2/
      ...
  migrate.js           # Script to help migrate existing files
  build.js             # Script to combine HTML + JS for Anki
  package.json
```

## Implementation Steps

1. **Create directory structure**
```bash
mkdir -p templates src tests build
```

2. **Create migration script (migrate.js)**
```javascript
const fs = require('fs');
const path = require('path');

// Get all top-level directories excluding node_modules and our new structure dirs
const excludeDirs = ['node_modules', 'templates', 'src', 'tests', 'build', '.git'];
const templateDirs = fs.readdirSync('./')
  .filter(file => fs.statSync(path.join('./', file)).isDirectory())
  .filter(dir => !excludeDirs.includes(dir));

console.log('Found template directories:', templateDirs);

templateDirs.forEach(dir => {
  console.log(`\nMigrating ${dir}...`);
  
  // Create destination directories
  fs.mkdirSync(`./templates/${dir}`, { recursive: true });
  fs.mkdirSync(`./src/${dir}`, { recursive: true });
  fs.mkdirSync(`./tests/${dir}`, { recursive: true });
  
  // Extract JavaScript from front.js and back.js
  let scriptContent = '';
  let frontHtml = '';
  let backHtml = '';
  
  // Process front.js
  if (fs.existsSync(`./${dir}/front.js`)) {
    const frontContent = fs.readFileSync(`./${dir}/front.js`, 'utf8');
    
    // Look for script tags
    const scriptTagMatch = frontContent.match(/<script>([\s\S]*?)<\/script>/);
    
    if (scriptTagMatch) {
      // Found script tags
      scriptContent += scriptTagMatch[1] + '\n';
      frontHtml = frontContent.replace(/<script>[\s\S]*?<\/script>/, '');
    } else {
      // No script tags, assume it's a mix or just HTML
      console.log(`No script tags found in ${dir}/front.js - treating as HTML`);
      frontHtml = frontContent;
    }
    
    fs.writeFileSync(`./templates/${dir}/front.html`, frontHtml.trim());
  }
  
  // Process back.js
  if (fs.existsSync(`./${dir}/back.js`)) {
    const backContent = fs.readFileSync(`./${dir}/back.js`, 'utf8');
    
    // Look for script tags
    const scriptTagMatch = backContent.match(/<script>([\s\S]*?)<\/script>/);
    
    if (scriptTagMatch) {
      // Found script tags
      scriptContent += scriptTagMatch[1] + '\n';
      backHtml = backContent.replace(/<script>[\s\S]*?<\/script>/, '');
    } else {
      // No script tags, assume it's a mix or just HTML
      console.log(`No script tags found in ${dir}/back.js - treating as HTML`);
      backHtml = backContent;
    }
    
    fs.writeFileSync(`./templates/${dir}/back.html`, backHtml.trim());
  }
  
  // Write the combined script file
  if (scriptContent) {
    fs.writeFileSync(`./templates/${dir}/script.js`, scriptContent.trim());
    
    // Create exportable module
    const exportableJs = 
`// Exported functions from ${dir} template
${scriptContent}

// Export all functions that should be testable
module.exports = {
  // TODO: Add your function names here
  // functionA,
  // functionB
};`;
    
    fs.writeFileSync(`./src/${dir}/index.js`, exportableJs);
    
    // Create test file template
    const testJs = 
`// Tests for ${dir} template functions
const { 
  // TODO: Add your function names here
  // functionA, 
  // functionB 
} = require('../../src/${dir}');

describe('${dir} template', () => {
  // TODO: Add your tests here
  // test('functionA should do something', () => {
  //   expect(functionA()).toBe(expectedResult);
  // });
});`;
    
    fs.writeFileSync(`./tests/${dir}/script.test.js`, testJs);
  }
  
  console.log(`Successfully migrated ${dir}`);
});
```

3. **Create build script (build.js)**
```javascript
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
```

4. **Update package.json**
```json
{
  "scripts": {
    "migrate": "node migrate.js",
    "build": "node build.js",
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^29.5.0"
  },
  "jest": {
    "moduleDirectories": ["node_modules", "src"],
    "testMatch": ["**/tests/**/*.test.js"]
  }
}
```

## Migration Workflow

1. Install dependencies:
   ```
   npm install --save-dev jest
   ```

2. Run the migration script:
   ```
   node migrate.js
   ```

3. Manually check the migrated files:
   - Verify HTML templates in `templates/*/front.html` and `templates/*/back.html`
   - Review JavaScript code in `templates/*/script.js`
   - Update `src/*/index.js` to export the specific functions you want to test
   - Update `tests/*/script.test.js` to include your actual test cases

4. Build the combined templates:
   ```
   node build.js
   ```

5. Test your JavaScript code:
   ```
   npm test
   ```

6. Copy the built files from `build/*/front.js` and `build/*/back.js` to Anki

## Example: Testing a Function

Assuming you have a function in your template:

```javascript
// In templates/order-of-operations/script.js
function generateProblem() {
  // Your code here
  return problem;
}
```

You would:

1. Add it to exports in `src/order-of-operations/index.js`:
   ```javascript
   module.exports = {
     generateProblem
   };
   ```

2. Test it in `tests/order-of-operations/script.test.js`:
   ```javascript
   const { generateProblem } = require('../../src/order-of-operations');
   
   describe('Order of Operations template', () => {
     test('generateProblem should return a valid problem', () => {
       const problem = generateProblem();
       expect(problem).toBeDefined();
       // Add more specific assertions
     });
   });
   ```

This restructuring maintains your current workflow of copying templates into Anki while making the JavaScript code more maintainable and testable.
