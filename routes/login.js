const express = require("express");
const { registerUser, verifyUser } = require("../controllers/auth.register");
const { forgotPassword, passwordReset } = require("../controllers/auth.forgot");
const { loginUser, logout } = require("../controllers/auth.login");

const loginrouter = express.Router();

loginrouter.post("/register", registerUser);
loginrouter.post("/verifymail", verifyUser);

loginrouter.post("/forgotpassword", forgotPassword);
loginrouter.post("/passwordreset/:token", passwordReset);

loginrouter.post("/login", loginUser);
loginrouter.post("/logout", logout);

module.exports = loginrouter;