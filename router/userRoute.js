const express = require("express").Router();
const router = express.Router();

// === user controllers ===
const { register, login, checkUser } = require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");

// ==register routers ====
router.post("/register", register);

//  === login user no authmiddleware neeeded here==
router.post("/login", login);

// === check user requires auth
router.get("/checkUser", authMiddleware, checkUser);

module.exports = router;
