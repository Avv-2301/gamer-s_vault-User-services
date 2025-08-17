const express = require("express");
const { userSignUp } = require("../../controllers/app/auth");

const router = express.Router();

router.post("/register", userSignUp);

module.exports = router;