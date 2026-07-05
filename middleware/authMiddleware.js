const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(req.method, req.originalUrl);
  console.log("Authorization:", req.headers.authorization);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Authentications invalid",
    });
  }

  const token = authHeader.split(" ")[1];
  console.log("TOKEN", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("JWT ERROR", error.message);
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Authentication invalid",
    });
  }
}

module.exports = authMiddleware;
