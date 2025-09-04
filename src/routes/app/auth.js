const express = require("express");
const {
  userSignUp,
  checkPasswordStrength,
  login,
} = require("../../controllers/app/auth");
const { getUserData } = require("../../controllers/app/userData");

const router = express.Router();

//Authenticatin Routes
router.post("/register", userSignUp);
router.post("/login", login);
router.post("/check-password-strength", checkPasswordStrength);

//User Routes
router.get("/get-user/:id", getUserData);

module.exports = router;
