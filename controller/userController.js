const dbConnection = require("../db/dbconfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

require("dotenv").config();

//  ==== register ===
async function register(req, res) {
  const { username, first_name, last_name, email, password } = req.body;

  if (!username || !first_name || !last_name || !email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "please provide all required fields",
    });
  }
  if (password.length < 8) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad request",
      message: "password must be at lest 8 characters",
    });
  }
  //   ===check if user exists
  try {
    const [users] = await dbConnection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );
    console.log(users);
    if (users.length > 0) {
      return res.status(400).json({
        error: "Conflict",
        message: "user already exists",
      });
    }
    //  ==== hash passwords
    const hashedPassword = await bcrypt.hash(password, 10);

    const [rows] = await dbConnection.query("SHOW CREATE TABLE users");
    console.log(rows[0]["Create Table"]);

    // == insrt new user
    const [result] = await dbConnection.query(
      "INSERT INTO users (username, first_name, las_tname, email, password) VALUES (?, ?, ?, ?, ?)",
      [username, first_name, last_name, email, hashedPassword],
    );
    console.log("Insert result:", result);

    return res.status(StatusCodes.CREATED).json({
      message: "user register sucessfully",
    });
  } catch (error) {
    console.log("Error inregister:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server  Error",
      message: error.message || "Unexpected error occurred",
    });
  }
}
//   ===== Login =====
async function login(req, res) {
  const { email, password } = req.body;

  // ==validate required fields
  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bade request",
      message: "please provide all password and email",
    });
  }

  // Check which database you're connected to
  const [count] = await dbConnection.query(
    "SELECT COUNT(*) AS  total FROM users",
  );
  console.log("Total users:", count);
  try {
    // ===find user by username or email
    const [users] = await dbConnection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );

    console.log("Users found:", users);

    if (users.length === 0) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalids email or password",
      });
    }

    const user = users[0];

    console.log("User from DB:", user);
    console.log("Entered password:", password);
    console.log("Stored hash:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: "Unatuhorized",
        message: "Invalid email or password",
      });
    }
    const username = user.username;
    const user_id = user.user_id;

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(StatusCodes.OK).json({
      message: "Login users sucessfully",
      token,
    });
  } catch (error) {
    console.log("LOGIN ERROR", error);
    return res.status(500).json({
      error: "Server Error",
      message: error.message,
    });
  }
}

// == check user ==
async function checkUser(req, res) {
  //   const username
  const { user_id } = req.user;

  const [users] = await dbConnection.query(
    "SELECT username, email FROM users WHERE user_id = ?",
    [user_id],
  );
  if (users.length === 0) {
    return res.status(404).json({
      message: "User not founds",
    });
  }
  res.status(StatusCodes.OK).json({
    user: users[0],
  });
}
module.exports = { register, login, checkUser };
