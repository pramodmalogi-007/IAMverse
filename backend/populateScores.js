const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'questionnaire.json');

const PRODUCTS_LIST = ["okta", "entra", "sailpoint", "cyberark", "ping", "oracle", "saviynt", "ibm", "onelogin", "forgerock"];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

try {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let updatedCount = 0;

  const updatedData = data.map(q => {
    if (q.type === 'checkbox' || q.type === 'radio' || q.type === 'rating') {
      if (q.options && q.options.length > 0) {
        q.options = q.options.map(opt => {
          // If scores is empty or doesn't exist, populate it
          if (!opt.scores || Object.keys(opt.scores).length === 0) {
            opt.scores = {};
            
            // Pick 2-4 random products to assign points to
            const numProducts = getRandomInt(2, 4);
            const shuffledProducts = [...PRODUCTS_LIST].sort(() => 0.5 - Math.random());
            
            for (let i = 0; i < numProducts; i++) {
              const product = shuffledProducts[i];
              // Random score between 5 and 20, rounded to nearest 5
              opt.scores[product] = getRandomInt(1, 4) * 5; 
            }
            updatedCount++;
          }
          return opt;
        });
      }
    }
    return q;
  });

  fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
  console.log(`Successfully populated scores for ${updatedCount} options in questionnaire.json!`);

} catch (err) {
  console.error('Error populating scores:', err);
}
