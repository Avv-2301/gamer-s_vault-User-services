const express = require("express");
const {
  userSignUp,
  checkPasswordStrength,
  login,
} = require("../../controllers/app/auth");
const { getUserData } = require("../../controllers/app/userData");
const{ internalAuth } = require('../../middleware/internalAuth')

const router = express.Router();

//Authenticatin Routes
router.post("/register", userSignUp);
router.post("/login", login);
router.post("/check-password-strength", checkPasswordStrength);

//User Routes
router.get("/:id",internalAuth, getUserData);

module.exports = router;
