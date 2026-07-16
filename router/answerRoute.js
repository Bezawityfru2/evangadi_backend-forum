const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  postAnswer,
  getAnswerForQuestion,
} = require("../controller/answerController");

// == post answer
router.post("/", authMiddleware, postAnswer);

// ===get answer for a question
router.get("/:questionId", getAnswerForQuestion);

module.exports = router;
