const dbConnection = require("../db/dbconfig");
const { StatusCodes } = require("http-status-codes");

console.log("Has query:", typeof dbConnection.query);

// ==Post a new question ==
async function postQuestion(req, res) {
  const { title, description, tag } = req.body;
  const user_id = req.user.user_id;
  console.log(req.body);
  console.log(req.user);
  if (!title || !description) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad request",
      message: "please provide title and description",
    });
  }
  try {
    const [db] = await dbConnection.query("SELECT DATABASE() AS db");
    console.log(db);

    const [result] = await dbConnection.query(
      `INSERT INTO questions (user_id, title, description, tag) VALUES (?, ?, ?, ?, NOW())`,
      [user_id, title, description, tag],
    );
    console.log("Questions insert result:", result);

    res.status(StatusCodes.CREATED).json({
      message: "Question created successfully",
      question_id: result.insertId,
    });
  } catch (error) {
    console.log("Error in postQuestion:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal sever error",
    });
  }
}

// === GET all question =====
async function getAllQuestion(req, res) {
  const { limit = 10, offset = 0 } = req.query;

  try {
    const [questions] = await dbConnection.query(
      `SELECT q.question_id, q.title, q.description, q.tag, q.created_at, u.username
            FROM questions q
            JOIN  users u ON q.user_id = u.user_id
            ORDER BY q.created_at DESC
             LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)],
    );

    res.status(StatusCodes.OK).json({ questions });
  } catch (error) {
    console.log("Error in getAllQuestions:", error);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errror: "Internal Server errors",
      message: "An unexpected error occurred",
    });
  }
}

// === gET single question by ID
async function getSingleQuestion(req, res) {
  const { id } = req.params;

  try {
    const [questions] = await dbConnection.query(
      `SELECT q.question_id, q.title, q.description, q.tag, q.created_at, u.username
                FROM questions q
                JOIN users u ON q.user_id = u.user_id
                WHERE q.question_id = ?`,
      [id],
    );
    console.log("question_id variable:", question_id);

    if (!questions || questions.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not found",
        message: " Question not found",
      });
    }
    const [answers] = await dbConnection.query(
      `SELECT q.title, q.description, a.answer_id, a.content, a.created_at, u.username
                FROM answers a
                JOIN users u ON a.user_id = u.user_id
                JOIN questions q ON a.question_id = q.question_id
                WHERE a.question_id = ?
                ORDER BY a.created_at ASC`,
      [id],
    );
    res.status(StatusCodes.OK).json({
      question: questions[0],
      answers,
    });
  } catch (error) {
    console.log("Error in getSinglequestion:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
    });
  }
}

module.exports = { postQuestion, getAllQuestion, getSingleQuestion };
