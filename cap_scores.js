const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'data', 'questionnaire.json');
let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let updated = 0;

data.forEach(q => {
  if (q.options) {
    q.options.forEach(opt => {
      if (opt.scores) {
        for (const prod in opt.scores) {
          if (opt.scores[prod] > 10) {
            opt.scores[prod] = 10;
            updated++;
          }
        }
      }
    });
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Updated ${updated} scores to cap at 10.`);
