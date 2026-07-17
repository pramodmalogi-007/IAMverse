const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'data', 'questionnaire.json');
let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// The mapping matrix
const vendorKeywords = {
  okta: ['startup', 'b2b', 'ciam', 'sso', 'mfa', 'passwordless', 'modern', 'api', 'web', 'SaaS', 'cloud', 'mid-market', 'agile'],
  entra: ['microsoft', 'office 365', 'active directory', 'hybrid', 'conditional access', 'windows', 'azure', 'global enterprise'],
  sailpoint: ['governance', 'compliance', 'iga', 'access reviews', 'lifecycle', 'audit', 'roles', 'complex enterprise', 'healthcare', 'regulated'],
  cyberark: ['pam', 'privileged', 'secrets', 'vault', 'endpoints', 'ransomware', 'admins', 'contractors', 'high risk'],
  ping: ['ciam', 'customer', 'banking', 'finance', 'hybrid it', 'federation', 'scale', 'enterprise ciam', 'on-premise', 'complex'],
  forgerock: ['ciam', 'consumer', 'iot', 'millions', 'scale', 'customization', 'devices', 'identity tree'],
  hashicorp: ['devops', 'ci/cd', 'secrets', 'developers', 'cloud-native', 'ephemeral', 'infrastructure', 'kubernetes'],
  saviynt: ['cloud iga', 'cloud pam', 'healthcare', 'convergence', 'aws', 'gcp'],
  oracle: ['legacy', 'on-premise', 'mainframe', 'government', 'highly regulated', 'databases'],
  ibm: ['legacy', 'mainframe', 'government', 'highly regulated', 'db2']
};

function scoreVendor(text, vendor) {
  let score = 0;
  const lowerText = text.toLowerCase();
  
  const keywords = vendorKeywords[vendor];
  if (!keywords) return 0;
  
  for (const keyword of keywords) {
    if (lowerText.includes(keyword)) {
      score += 5; // Base bump for a hit
    }
  }
  
  // Cap at 10
  return Math.min(10, score);
}

// Ensure every option has at least ONE score, otherwise fallback to okta/entra generic
function ensureFallback(scores) {
  if (Object.keys(scores).length === 0) {
    return { okta: 5, entra: 5 }; // Generic fallback
  }
  return scores;
}

let optionsProcessed = 0;

data.forEach(q => {
  const qText = q.text || "";
  
  if (q.options) {
    q.options.forEach(opt => {
      const optText = opt.label || "";
      const combinedText = `${qText} ${optText}`;
      
      let newScores = {};
      
      // Calculate scores for all vendors
      Object.keys(vendorKeywords).forEach(vendor => {
        let vScore = scoreVendor(combinedText, vendor);
        if (vScore > 0) {
          newScores[vendor] = vScore;
        }
      });
      
      // If it's a completely generic question that hit 0 keywords, give generic points
      newScores = ensureFallback(newScores);
      
      opt.scores = newScores;
      optionsProcessed++;
    });
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Successfully mapped and allocated intelligent scores for ${optionsProcessed} options across ${data.length} questions.`);
