const fs = require('fs');
let content = fs.readFileSync('C:/MCA/New folder/IAM/IAM/backend/data/iamQuestionnaire.js', 'utf8');

const singleChoiceIds = [
  'q1', 'q2', 'q3', 'q4', 'q5', 'q6',
  'q8', 'q10', 'q11', 'q13',
  'q17', 'q18', 'q19', 'q20',
  'q21', 'q24', 'q28', 'q30',
  'q34', 'q36', 'q39', 'q41',
  'q42', 'q44', 'q47',
  'q49', 'q50', 'q51', 'q52', 'q53'
];

singleChoiceIds.forEach(id => {
  const regex = new RegExp('(id:\\\\s*\"' + id + '\"[\\\\s\\\\S]*?type:\\\\s*\")checkbox(\")', 'g');
  content = content.replace(regex, '$1radio$2');
});

fs.writeFileSync('C:/MCA/New folder/IAM/IAM/backend/data/iamQuestionnaire.js', content);
