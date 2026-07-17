const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\MCA\\New folder\\IAM\\IAM';

const excludeDirs = ['node_modules', 'dist', '.git', '.vscode'];
const includeExts = ['.js', '.jsx', '.json', '.html', '.css'];

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        replaceInDir(fullPath);
      }
    } else {
      const ext = path.extname(fullPath);
      if (includeExts.includes(ext)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Ensure not replacing it if it was somehow already replaced (idempotency)
        let newContent = content
          .replace(/IAMverse/g, 'IAMverse')
          .replace(/IAMverse/g, 'IAMverse')
          .replace(/IAMverse/g, 'IAMverse')
          .replace(/iamverse/g, 'iamverse');
          
        if (content !== newContent) {
          console.log(`Updated ${fullPath}`);
          fs.writeFileSync(fullPath, newContent, 'utf8');
        }
      }
    }
  }
}

replaceInDir(targetDir);
console.log("Replacement complete.");
