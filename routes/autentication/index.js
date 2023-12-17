const express = require("express");
const router = express.Router();
const { login, register } = require("../../controllers/authController");

//saving the new user into database
router.post("/register", register);

//validating the user to login
router.post("/login", login);

module.exports = router;
