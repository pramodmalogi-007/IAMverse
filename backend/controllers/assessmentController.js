// backend/controllers/assessmentController.js
const { findAll, insertOne } = require("../utils/fileStore");
const { computeRecommendations } = require("../utils/recommendationEngine");

// GET /api/assessment/questions
const getQuestions = (req, res) => {
  const questionnaire = findAll("questionnaire.json");
  return res.status(200).json({ success: true, questions: questionnaire });
};

const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

// POST /api/assessment/submit
const submitAssessment = (req, res) => {
  const { answers } = req.body;

  if (!answers || typeof answers !== "object") {
    return res.status(400).json({ success: false, message: "answers object is required" });
  }

  const questionnaire = findAll("questionnaire.json");
  const result = computeRecommendations(answers, questionnaire);

  // Optional auth to save assessment
  let userId = null;
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
      userId = decoded.uid || decoded.id;
    } catch (err) {
      // ignore invalid token for optional auth
    }
  }

  if (userId) {
    insertOne("assessments.json", {
      id: uuidv4(),
      userId,
      answers,
      result,
      createdAt: new Date().toISOString()
    });
  }

  return res.status(200).json({
    success: true,
    message: "Assessment submitted successfully",
    result,
  });
};

module.exports = { getQuestions, submitAssessment };