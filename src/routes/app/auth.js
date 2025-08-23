const express = require("express");
const { userSignUp, checkPasswordStrength } = require("../../controllers/app/auth");
const { getUserData } = require("../../controllers/app/userData");

const router = express.Router();

router.post("/register", userSignUp);
router.get("/get-user/:id", getUserData);
router.post("/check-password-strength", checkPasswordStrength)

module.exports = router;