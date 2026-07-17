const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\MCA\\New folder\\IAM\\IAM\\frontend\\src';

const includeExts = ['.js', '.jsx'];

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      replaceInDir(fullPath);
    } else {
      const ext = path.extname(fullPath);
      if (includeExts.includes(ext)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Edge cases for broken spans
        let newContent = content
          .replace(/IAM<span.*?>Shield<\/span>/g, 'IAM<span>verse</span>')
          .replace(/<span.*?>IAM<\/span>\s*<span.*?>\s*Shield<\/span>/g, (match, p1, p2) => {
             // Let's just do a simpler replace for the exact strings
             return match.replace(/Shield/g, 'verse');
          });
          
        if (content !== newContent) {
          console.log(`Updated spans in ${fullPath}`);
          fs.writeFileSync(fullPath, newContent, 'utf8');
        }
      }
    }
  }
}

replaceInDir(targetDir);
console.log("Span replacement complete.");
