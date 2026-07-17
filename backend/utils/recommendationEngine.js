// backend/utils/recommendationEngine.js
// Maps questionnaire answers to IAM product scores and produces recommendations

const fs = require('fs');
const path = require('path');

function getProducts() {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8');
    const productsArray = JSON.parse(data);
    const productsMap = {};
    productsArray.forEach(p => {
      productsMap[p.id] = p;
    });
    return productsMap;
  } catch (err) {
    console.error("Error reading products.json", err);
    return {};
  }
}


// ─── Scoring rules ─────────────────────────────────────────────────────────────
// Each selected option ID maps to { productId: points } increments

const SCORING_MAP = {
  // Q1 — Org type
  q1_a: { okta: 3, ping: 2, onelogin: 4 }, 
  q1_b: { okta: 2, entra: 2, onelogin: 3 },
  q1_c: { entra: 3, sailpoint: 2, cyberark: 2, saviynt: 2, ibm: 2 },
  q1_d: { entra: 3, sailpoint: 3, cyberark: 3, ping: 2, oracle: 3, ibm: 3 },
  q1_e: { entra: 2, cyberark: 3, sailpoint: 3, oracle: 3, ibm: 3 },
  q1_f: { okta: 2, forgerock: 2, onelogin: 2 },

  // Q7 — Auth methods
  q7_a: { okta: 4, entra: 3, ping: 3 }, // SSO
  q7_b: { okta: 3, entra: 4, cyberark: 2 }, // MFA
  q7_c: { okta: 4, ping: 3 }, // Passwordless
  q7_d: { okta: 3, ping: 2 }, // Social login
  q7_e: { ping: 4, forgerock: 4, entra: 3 }, // SAML
  q7_f: { okta: 3, ping: 3, forgerock: 3 }, // OIDC
  q7_g: { entra: 4, forgerock: 3 }, // Kerberos
  q7_h: { cyberark: 3, forgerock: 3 }, // PKI/X.509
  q7_i: { okta: 4, entra: 3 }, // Adaptive MFA
  q7_j: { cyberark: 3, entra: 2 }, // Hardware token

  // Q8 — CIAM
  q8_a: { ping: 5, okta: 3, forgerock: 4 },
  q8_b: { ping: 4, okta: 3, forgerock: 3 },
  q8_c: { okta: 3, entra: 3 },

  // Q9 — Lifecycle
  q9_a: { okta: 3, sailpoint: 3, onelogin: 3 },
  q9_b: { sailpoint: 4, okta: 2, saviynt: 3 },
  q9_c: { sailpoint: 4, okta: 3, saviynt: 3 },
  q9_d: { okta: 4, sailpoint: 3, onelogin: 2 },
  q9_e: { sailpoint: 4, entra: 3, saviynt: 3 },
  q9_f: { okta: 3, onelogin: 2 },
  q9_g: { sailpoint: 3, entra: 2, oracle: 2 },
  q9_h: { ping: 3, forgerock: 3, sailpoint: 2, ibm: 2 },

  // Q10 — Developer experience
  q10_d: { okta: 4 },
  q10_e: { okta: 5, onelogin: 3 },

  // Q11 — Identity store
  q11_a: { entra: 4, forgerock: 3, oracle: 3, ibm: 3 }, // AD on-prem
  q11_b: { entra: 5 }, // Azure AD
  q11_c: { okta: 3, ping: 2, onelogin: 3 }, // Google Workspace
  q11_d: { sailpoint: 4, okta: 3, oracle: 4 }, // Workday/SAP

  // Q12 — Machine identities
  q12_b: { cyberark: 5 },
  q12_c: { cyberark: 5, ibm: 3 },
  q12_d: { cyberark: 5, ibm: 4 },
  q12_e: { forgerock: 4, cyberark: 3 },
  q12_f: { cyberark: 5, ibm: 4 },

  // Q14 — Access control models
  q14_a: { sailpoint: 3, okta: 2 }, // RBAC
  q14_b: { sailpoint: 4, forgerock: 3 }, // ABAC
  q14_c: { sailpoint: 4, ping: 3 }, // PBAC
  q14_d: { okta: 4, entra: 4 }, // ZTNA
  q14_e: { cyberark: 4, sailpoint: 3 }, // JIT
  q14_f: { cyberark: 3, sailpoint: 3 }, // Least privilege

  // Q16 — IGA
  q16_a: { sailpoint: 5, saviynt: 4 },
  q16_b: { sailpoint: 5, saviynt: 4, ibm: 3 },
  q16_c: { sailpoint: 5, cyberark: 2, saviynt: 3 },
  q16_d: { sailpoint: 4, saviynt: 4 },
  q16_e: { sailpoint: 5, entra: 3, saviynt: 4 },
  q16_f: { sailpoint: 4, ping: 2, ibm: 2 },

  // Q17 — Access reviews
  q17_c: { sailpoint: 4 },
  q17_d: { sailpoint: 5 },

  // Q26 — PAM capabilities
  q26_a: { cyberark: 5 },
  q26_b: { cyberark: 5 },
  q26_c: { cyberark: 5 },
  q26_d: { cyberark: 5, ibm: 3 },
  q26_e: { cyberark: 5, saviynt: 3 },
  q26_f: { cyberark: 4 },
  q26_g: { cyberark: 4 },
  q26_h: { cyberark: 4 },
  q26_i: { cyberark: 4 },
  q26_j: { cyberark: 5 },

  // Q29 — Secrets management
  q29_a: { cyberark: 5, ibm: 3 },
  q29_b: { cyberark: 5, ibm: 3 },
  q29_c: { cyberark: 5, ibm: 3 },
  q29_d: { cyberark: 5, ibm: 3 },

  // Q32 — Compliance frameworks
  q32_a: { entra: 3, okta: 3 }, // GDPR
  q32_b: { cyberark: 4, sailpoint: 4 }, // HIPAA
  q32_c: { sailpoint: 5, entra: 3 }, // SOX
  q32_d: { cyberark: 5, sailpoint: 4 }, // PCI-DSS
  q32_e: { entra: 3, sailpoint: 3 }, // ISO 27001
  q32_f: { sailpoint: 4, entra: 3 }, // SOC2
  q32_g: { entra: 4, cyberark: 3 }, // FedRAMP

  // Q36 — Deployment
  q36_a: { okta: 5, entra: 4, ping: 3, saviynt: 4, onelogin: 4 }, 
  q36_b: { forgerock: 4, cyberark: 3, entra: 3, oracle: 5, ibm: 4 }, 
  q36_c: { entra: 4, forgerock: 3, oracle: 4, ping: 4 }, 
  q36_d: { forgerock: 4, cyberark: 2 }, 

  // Q37 — Cloud platforms
  q37_a: { okta: 3, saviynt: 3 }, 
  q37_b: { entra: 5 }, 
  q37_c: { okta: 3, saviynt: 3 },

  // Q41 — Kubernetes maturity
  q41_c: { cyberark: 3, ibm: 3 },
  q41_d: { cyberark: 5, ibm: 4 },
  q41_e: { cyberark: 5, ibm: 5 },

  // Q42 — Zero trust
  q42_c: { okta: 4, entra: 4 },
  q42_d: { okta: 3, entra: 3, cyberark: 2 },
  q42_e: { okta: 4, entra: 4, cyberark: 3 },

  // Q46 — AI/ML
  q46_a: { sailpoint: 4 },
  q46_b: { entra: 3, okta: 3 },
  q46_e: { okta: 4, entra: 3 },
  q46_f: { sailpoint: 4 },
  q46_g: { sailpoint: 4 },

  // Q49 — Budget
  q49_a: { forgerock: 3, onelogin: 3 }, // Open source/Low cost
  q49_b: { okta: 2, onelogin: 3 },
  q49_c: { okta: 3, entra: 3, saviynt: 2 },
  q49_d: { okta: 3, entra: 3, sailpoint: 2, ibm: 2 },
  q49_e: { cyberark: 4, sailpoint: 4, entra: 3, oracle: 4 },
  q49_f: { cyberark: 5, sailpoint: 5, entra: 4, oracle: 5 },

  // Q51 — Vendor lock-in concern
  q51_c: { forgerock: 3, ping: 3 },
  q51_d: { forgerock: 4, ping: 4, saviynt: 3 },

  // Section 11 ratings (r_*) handled separately in engine
};

/**
 * Main scoring function
 * @param {Object} answers - { q1: ["q1_a", "q1_c"], q56: { r_sso: 5, r_mfa: 4 }, ... }
 * @param {Array} questionnaire - The full questionnaire JSON data from the database
 * @returns {{ topProduct, otherProducts, scores, capabilityProfile }}
 */
function computeRecommendations(answers, questionnaire = []) {
  const PRODUCTS = getProducts();
  const scores = {};
  
  // Initialize scores based on actual products in the DB
  for (const pid of Object.keys(PRODUCTS)) {
    scores[pid] = 0;
  }

  // Build a lookup map of all dynamic scores from the questionnaire
  const dynamicScoresMap = {};
  const questionTypes = {};
  questionnaire.forEach(q => {
    if (q.id) {
      questionTypes[q.id] = q.type;
    }
    if (q.options && Array.isArray(q.options)) {
      q.options.forEach(opt => {
        if (opt.scores && Object.keys(opt.scores).length > 0) {
          dynamicScoresMap[opt.id] = opt.scores;
        }
      });
    }
  });

  const ratingProductMap = {
    r_sso: { okta: 1.5, entra: 1, ping: 1, onelogin: 1.5, ibm: 1 },
    r_mfa: { okta: 1, entra: 1.5, cyberark: 0.5, onelogin: 1 },
    r_passwordless: { okta: 1.5, ping: 1 },
    r_iga: { sailpoint: 2, okta: 0.5, saviynt: 2, oracle: 1, ibm: 1 },
    r_scim: { okta: 1.5, sailpoint: 1, saviynt: 1, onelogin: 1 },
    r_pam: { cyberark: 2 },
    r_session: { cyberark: 1.5 },
    r_directory: { okta: 1.5, entra: 1, oracle: 1.5 },
    r_api: { okta: 2, forgerock: 1 },
    r_compliance: { sailpoint: 1.5, entra: 1, saviynt: 1.5, ibm: 1.5 },
    r_zerotrust: { okta: 1.5, entra: 1.5, saviynt: 1 },
    r_siem: { entra: 1, sailpoint: 1 },
    r_ai: { sailpoint: 1.5, entra: 1, saviynt: 1 },
    r_secrets: { cyberark: 1 },
    r_ciam: { ping: 2, forgerock: 1.5, okta: 1 },
    r_epm: { cyberark: 2 },
    r_adaptive: { okta: 1.5, entra: 1 },
    r_certify: { sailpoint: 2, saviynt: 1.5 },
  };

  let capabilityProfileMap = {};

  for (const [qId, ans] of Object.entries(answers)) {
    if (!ans) continue;
    
    // Check if rating type (or hardcoded q56 legacy check if type missing)
    if (questionTypes[qId] === 'rating' || (qId === "q56" && !questionTypes[qId])) {
      const ratings = ans;
      for (const [capId, rating] of Object.entries(ratings)) {
        const mult = Number(rating) || 0;
        
        // Add to capability profile
        capabilityProfileMap[capId] = mult;

        // Prioritize dynamic score over hardcoded rule for ratings
        const rule = dynamicScoresMap[capId] || ratingProductMap[capId];
        if (rule) {
          for (const [product, weight] of Object.entries(rule)) {
            if (scores[product] !== undefined) scores[product] += mult * Number(weight);
          }
        }
      }
    } else {
      // Score checkbox and radio answers
      const selectedOptions = Array.isArray(ans) ? ans : [ans];

      for (const optionId of selectedOptions) {
        // Prioritize dynamic score over hardcoded rule
        const rule = dynamicScoresMap[optionId] || SCORING_MAP[optionId];
        if (rule) {
          for (const [product, pts] of Object.entries(rule)) {
            if (scores[product] !== undefined) scores[product] += Number(pts) || 0;
          }
        }
      }
    }
  }

  // Sort by score descending
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([id, score]) => ({ ...(PRODUCTS[id] || { id, name: id }), score }));

  const topProduct = sorted[0] || null;
  const otherProducts = sorted.slice(1, 4); // next 3

  // Build capability profile from all aggregated ratings
  const capabilityProfile = Object.entries(capabilityProfileMap).map(([id, rating]) => ({
    id,
    label: id.replace("r_", "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    rating: Number(rating) || 0,
  }));

  return { topProduct, otherProducts, scores, capabilityProfile };
}

module.exports = { computeRecommendations, getProducts };
