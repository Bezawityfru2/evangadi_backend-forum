const dbConnection = require("../db/dbconfig");
const { StatusCodes } = require("http-status-codes");

//  === PostAnswer
async function postAnswer(req, res) {
  const { question_id, content } = req.body;

  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Unauthorized",
      message: "user not authenticated",
    });
  }

  const { user_id } = req.user;

  if (!question_id || !content) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad request",
      message: "please provide question id and content",
    });
  }
  try {
    const [questions] = await dbConnection.query(
      "SELECT * FROM questions WHERE question_id = ?",
      [question_id],
    );

    if (!questions || questions.length === 0) {
      console.log("Questions not found");

      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Question not found",
      });
    }
    const [result] = await dbConnection.query(
      "INSERT INTO answers (user_id, question_id, content) VALUES (?, ?, ?)",
      [user_id, question_id, content],
    );
    res.status(StatusCodes.CREATED).json({
      message: "Answer posted successfully",
      answer_id: result.insertId,
    });
  } catch (error) {
    console.log("Error in postAnswer:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
}

// get answer for question
async function getAnswerForQuestion(req, res) {
  const question_id = req.params.questionId;

  console.log("req.params:", req.params);
  console.log("questionId:", req.params.questionId);

  try {
    // fetch question first
    const [questions] = await dbConnection.query(
      "SELECT * FROM questions  WHERE question_id =?",
      [questionId],
    );
    console.log("question_id:", question_id);

    if (!questions || questions.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not found",
        message: "Question not found",
      });
    }
    // Fetch answers for that question
    const [answers] = await dbConnection.query(
      `SELECT a.answer_id, a.content, a.created_at, u.username
            FROM answers a
            JOIN users u ON a.user_id = u.user_id
            WHERE a.question_id = ?
            ORDER BY a.created_at ASC`,
      [question_id],
    );
    res.status(StatusCodes.OK).json({ answers });
  } catch (error) {
    console.log("Error in getAnswerForQuestion:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });
  }
}
module.exports = { postAnswer, getAnswerForQuestion };
