const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  postQuestion,
  getAllQuestion,
  getSingleQuestion
} = require("../controller/questionController");

// ===POST aquestion (authmiddleware required)
router.post("/", authMiddleware, postQuestion);

// === GET all questions
router.get("/", getAllQuestion);

// === GET single question
router.get("/:id", getSingleQuestion);

module.exports = router;
