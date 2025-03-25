const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

// Get all template directories
const templateDirs = fs.readdirSync('./templates');

console.log('Building templates:', templateDirs);

// Function to extract exported functions from index.js
function extractFunctionsFromIndex(indexPath) {
  try {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const ast = parse(indexContent, { sourceType: 'module' });
    
    const exportedFunctions = {};
    const allFunctions = {};
    
    // First pass: collect all function declarations
    traverse(ast, {
      FunctionDeclaration(path) {
        const name = path.node.id.name;
        allFunctions[name] = generate(path.node).code;
      }
    });
    
    // Second pass: get the exported functions
    traverse(ast, {
      AssignmentExpression(path) {
        if (
          path.node.left.type === 'MemberExpression' &&
          path.node.left.object.name === 'module' &&
          path.node.left.property.name === 'exports' &&
          path.node.right.type === 'ObjectExpression'
        ) {
          path.node.right.properties.forEach(prop => {
            if (prop.key.name && prop.value.name && allFunctions[prop.value.name]) {
              exportedFunctions[prop.key.name] = allFunctions[prop.value.name];
            }
          });
        }
      }
    });
    
    return exportedFunctions;
  } catch (error) {
    console.error(`Error extracting functions from index: ${error.message}`);
    return {};
  }
}

// Function to find required functions from index in a file
function findRequiredFunctions(filePath, indexFunctions) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // First check with simple regex for function calls
    const allFunctionNames = Object.keys(indexFunctions);
    const additionalFunctions = new Set();
    
    // For generateMathExpression, we need to add insertParentheses
    if (fileContent.includes('generateMathExpression') && indexFunctions['insertParentheses']) {
      additionalFunctions.add('insertParentheses');
    }
    
    const ast = parse(fileContent, { sourceType: 'module' });
    const requiredFunctions = new Set();
    
    // Find destructuring require from index
    traverse(ast, {
      VariableDeclarator(path) {
        if (
          path.node.init && 
          path.node.init.type === 'ConditionalExpression' &&
          path.node.init.alternate.type === 'ObjectExpression' &&
          path.node.init.alternate.properties.length === 0 &&
          path.node.id.type === 'ObjectPattern'
        ) {
          // This looks like our conditional require pattern
          path.node.id.properties.forEach(prop => {
            if (prop.key.name) {
              requiredFunctions.add(prop.key.name);
            }
          });
        }
      }
    });
    
    // Add any additional required functions that might be dependencies
    additionalFunctions.forEach(name => requiredFunctions.add(name));
    
    return Array.from(requiredFunctions).filter(name => indexFunctions[name]);
  } catch (error) {
    console.error(`Error finding required functions: ${error.message}`);
    return [];
  }
}

// Function to process a file - directly replace imports and remove exports
function processFile(fileContent, requiredFunctions, indexFunctions) {
  // Extract the content without import/export statements
  let lines = fileContent.split('\n');
  let processedLines = [];
  let skipLines = false;
  let skipBrowserInit = false;
  let bracketDepth = 0; // Track function bracket depth for better formatting
  let inFunction = false;
  let inReturnObject = false;
  let functionIndent = 0;
  
  // Sanitize indentation in code
  const normalizeIndentation = (code) => {
    const lines = code.split('\n');
    return lines.map(line => {
      // Get the leading whitespace
      const leadingSpaces = line.match(/^(\s*)/)[0];
      // Replace with consistent indentation (4 spaces per level)
      const trimmed = line.trim();
      if (!trimmed) return '';
      return '    '.repeat(Math.floor(leadingSpaces.length / 2)) + trimmed;
    }).join('\n');
  };
  
  // Post-process function to properly format code with consistent braces and fix common JavaScript syntax issues
  const fixBraces = (code) => {
    // First normalize the indentation for better readability
    code = normalizeIndentation(code);
    
    // Fix common bracket issues
    return code
      // Fix missing closing braces in if statements
      .replace(/if\s*\([^{]+\)\s*{[^}]*?(?=\n\s*[a-zA-Z])/g, (match) => {
        if (!match.trim().endsWith('}')) {
          return match + '\n}';
        }
        return match;
      })
      
      // Fix missing semicolons after object literals
      .replace(/}\s*\n(\s*[a-zA-Z])/g, '};\n$1')
      
      // Add missing function closures with proper semicolons
      .replace(/function\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*{([\s\S]*?)(?=\n\s*\/\/|function\s+|$)/g, (match, name, body) => {
        // If the function doesn't end with a proper closure, add it
        if (!body.trim().endsWith('}')) {
          return `function ${name}(${match.match(/\([^)]*\)/)[0]}) {${body}\n}`;
        }
        return match;
      })
      
      // Fix return object literals without proper closure
      .replace(/return\s*{([\s\S]*?)(?=\n\s*})/g, (match) => {
        if (!match.trim().endsWith('}')) {
          return match + '\n    }';
        }
        return match;
      })
      
      // Fix if-statement with missing braces
      .replace(/if\s*\([^)]+\)\s*(\n\s*[^{])/g, (match, nextLine) => {
        return match.replace(nextLine, ' {\n' + nextLine + '\n}');
      })
      
      // Fix try-catch blocks
      .replace(/try\s*{([\s\S]*?)}\s*catch\s*\(([^)]+)\)\s*{/g, (match) => {
        return match;
      })
      
      // General cleanup
      .replace(/}\s*;(\s*[a-zA-Z])/g, '}\n$1')  // Fix extra semicolons
      .replace(/}\s*;(\s*\/\/)/g, '}\n$1')      // Fix comments after semicolons
      .replace(/}\s*;\s*}/g, '}\n}')            // Fix nested closures
      .replace(/}\s*;\s*else/g, '} else');      // Fix else statements
  };
  
  // First add the required functions from index.js
  const functionsToInline = requiredFunctions
    .filter(name => indexFunctions[name])
    .map(name => indexFunctions[name])
    .join('\n\n');
  
  // Add shared functions
  if (functionsToInline.trim()) {
    processedLines.push('// Shared functions');
    processedLines.push(functionsToInline);
    processedLines.push('');
  }
  
  // Process the file line by line, skipping require/export blocks
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip import lines
    if (line.includes('Import shared functions') || 
        line.includes('typeof require !== \'undefined\'')) {
      continue;
    }
    
    // Skip the destructuring declaration - we'll handle functions directly
    if (line.includes('const {') && line.includes('}')) {
      continue;
    }
    
    // Skip export blocks
    if (line.includes('// Export') || 
        line.includes('if (typeof module !== \'undefined\'')) {
      skipLines = true;
      continue;
    }
    
    // Skip browser init functions - they'll be executed directly in the IIFE
    if (line.includes('// Browser execution') || 
        line.includes('var browserInit = function()')) {
      skipBrowserInit = true;
      continue;
    }
    
    // Make sure to properly handle function braces
    if (line.includes('return {') && !line.includes('};')) {
      // This is likely an opening bracket for a return object, 
      // so ensure we add the line and keep processing
      processedLines.push(line);
      continue;
    }
    
    // Add closing braces for incomplete functions we encounter
    if (line.includes('}') && !line.includes('};') && 
        (i+1 < lines.length && lines[i+1].trim() === '')) {
      // This is a function body closing, add it with semi-colon
      processedLines.push('};');
      continue;
    }
    
    // If we're in a browser init block, look for the function body
    if (skipBrowserInit && (line.includes('if (!onBack)') || line.includes('if (onBack)'))) {
      // Found the actual init code block, extract only the condition
      
      // First check if it's front side (if (!onBack)) or back side (if (onBack))
      const isBackSide = line.includes('if (onBack)');
      
      // Create a cleaned up check for back or front
      if (isBackSide) {
        processedLines.push('// Check if we\'re on the back side');
        processedLines.push('var answerElement = document.getElementById("answer");');
        processedLines.push('if (answerElement) {');
      } else {
        processedLines.push('// Check if we\'re on the front side');
        processedLines.push('var answerElement = document.getElementById("answer");');
        processedLines.push('if (!answerElement) {');
      }
      
      // Continue processing the next lines
      skipBrowserInit = false;
      continue;
    }
    
    // Reset skip when we reach the end of an export block
    if (skipLines && line.includes('}')) {
      skipLines = false;
      continue;
    }
    
    // Skip the browser init execution code since we're using an IIFE
    if (line.includes('if (typeof window !== \'undefined\' && typeof document !== \'undefined\')') ||
        line.includes('browserInit();')) {
      skipLines = true;
      continue;
    }
    
    // End of the browser init execution block
    if (skipLines && line.includes('}')) {
      skipLines = false;
      continue;
    }
    
    // Skip browser init function closing
    if (line.includes('};')) {
      continue;
    }
    
    // Skip lines in the browser init function
    if (skipBrowserInit) {
      continue;
    }
    
    // Add the line if we're not skipping
    if (!skipLines) {
      processedLines.push(line);
    }
  }
  
  // Apply post-processing to fix common brace and semicolon issues
  return fixBraces(processedLines.join('\n'));
}

templateDirs.forEach(dir => {
  console.log(`\nProcessing template: ${dir}`);
  
  try {
    // Extract functions from index.js
    const indexPath = path.join('./src', dir, 'index.js');
    const indexFunctions = extractFunctionsFromIndex(indexPath);
    
    console.log(`Found ${Object.keys(indexFunctions).length} exportable functions in index.js`);
    
    // Create build directory if it doesn't exist
    const buildDir = path.join('./build', dir);
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }
    
    // Process front template
    const frontHtmlPath = path.join('./templates', dir, 'front.html');
    const frontJsPath = path.join('./src', dir, 'front.js');
    
    if (fs.existsSync(frontHtmlPath) && fs.existsSync(frontJsPath)) {
      // Find required functions
      const frontRequiredFunctions = findRequiredFunctions(frontJsPath, indexFunctions);
      console.log(`Front template requires ${frontRequiredFunctions.length} functions from index`);
      
      // Read files
      const frontHtmlContent = fs.readFileSync(frontHtmlPath, 'utf8');
      let frontJsContent = fs.readFileSync(frontJsPath, 'utf8');
      
      // Process the JS content
      frontJsContent = processFile(frontJsContent, frontRequiredFunctions, indexFunctions);
      
      // Create the combined file with an IIFE wrapper and error handling
      const frontCombined = `${frontHtmlContent}\n<script>\n(function() {\ntry {\n// Debug element for error logging\nvar debugElement = document.createElement('div');\ndebugElement.id = 'debug-output';\ndebugElement.style.display = 'none';\ndocument.body.appendChild(debugElement);\n\nfunction logDebug(message) {\n  if (debugElement) {\n    debugElement.textContent += message + '\\n';\n  }\n  console.log(message);\n}\n\nlogDebug('Starting front-side script');\n${frontJsContent}\nlogDebug('Front-side script completed');\n} catch (error) {\n  console.error('Error in front-side script:', error);\n  if (document.getElementById('question')) {\n    document.getElementById('question').innerHTML = 'Error: ' + error.message;\n  }\n  // Create debug element if it doesn't exist\n  if (!document.getElementById('debug-output')) {\n    var debugElement = document.createElement('div');\n    debugElement.id = 'debug-output';\n    document.body.appendChild(debugElement);\n  }\n  document.getElementById('debug-output').style.display = 'block';\n  document.getElementById('debug-output').innerHTML = 'Error details: ' + error.stack;\n}\n})();\n</script>`;
      fs.writeFileSync(path.join(buildDir, 'front.js'), frontCombined);
      console.log(`Built ${dir}/front.js`);
    } else {
      console.log(`Missing files for front template. HTML: ${fs.existsSync(frontHtmlPath)}, JS: ${fs.existsSync(frontJsPath)}`);
    }
    
    // Process back template
    const backHtmlPath = path.join('./templates', dir, 'back.html');
    const backJsPath = path.join('./src', dir, 'back.js');
    
    if (fs.existsSync(backHtmlPath) && fs.existsSync(backJsPath)) {
      // Find required functions
      const backRequiredFunctions = findRequiredFunctions(backJsPath, indexFunctions);
      console.log(`Back template requires ${backRequiredFunctions.length} functions from index`);
      
      // Read files
      const backHtmlContent = fs.readFileSync(backHtmlPath, 'utf8');
      let backJsContent = fs.readFileSync(backJsPath, 'utf8');
      
      // Process the JS content
      backJsContent = processFile(backJsContent, backRequiredFunctions, indexFunctions);
      
      // Create the combined file with an IIFE wrapper and error handling
      const backCombined = `${backHtmlContent}\n<script>\n(function() {\ntry {\n// Debug element for error logging\nvar debugElement = document.createElement('div');\ndebugElement.id = 'debug-output';\ndebugElement.style.display = 'none';\ndocument.body.appendChild(debugElement);\n\nfunction logDebug(message) {\n  if (debugElement) {\n    debugElement.textContent += message + '\\n';\n  }\n  console.log(message);\n}\n\nlogDebug('Starting back-side script');\n${backJsContent}\nlogDebug('Back-side script completed');\n} catch (error) {\n  console.error('Error in back-side script:', error);\n  if (document.getElementById('answer')) {\n    document.getElementById('answer').innerHTML = 'Error: ' + error.message;\n  }\n  // Create debug element if it doesn't exist\n  if (!document.getElementById('debug-output')) {\n    var debugElement = document.createElement('div');\n    debugElement.id = 'debug-output';\n    document.body.appendChild(debugElement);\n  }\n  document.getElementById('debug-output').style.display = 'block';\n  document.getElementById('debug-output').innerHTML = 'Error details: ' + error.stack;\n}\n})();\n</script>`;
      fs.writeFileSync(path.join(buildDir, 'back.js'), backCombined);
      console.log(`Built ${dir}/back.js`);
    } else {
      console.log(`Missing files for back template. HTML: ${fs.existsSync(backHtmlPath)}, JS: ${fs.existsSync(backJsPath)}`);
    }
  } catch (error) {
    console.error(`Error processing ${dir}: ${error.message}`);
  }
});