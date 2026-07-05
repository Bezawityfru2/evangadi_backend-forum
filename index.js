const express = require("express");
const cors = require("cors");

require("dotenv").config();
const app = express();

app.use(express.json());
app.use(cors());

// ==== db connections
let dbConnection = require("./db/dbconfig");

// ==authentication middleware
const authMiddleware = require("./middleware/authMiddleware");

// == routes
const userRoute = require("./router/userRoute");
const questionRoute = require("./router/questionRoute");
const answerRoute = require("./router/answerRoute");

//  FIX: NO auth here
app.use("/api/users", userRoute);

//  Protected routes
app.use("/api/questions", questionRoute);
app.use("/api/answers", answerRoute);



async function start() {
  try {
    console.log("Starting server...");

    const PORT = process.env.PORT || 5500;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Failed to start server:", error);
  }
}

start();
