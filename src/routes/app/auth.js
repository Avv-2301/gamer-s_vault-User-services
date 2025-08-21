const express = require("express");
const { userSignUp } = require("../../controllers/app/auth");
const { getUserData } = require("../../controllers/app/userData");

const router = express.Router();

router.post("/register", userSignUp);
router.get("/get-user/:id", getUserData);

module.exports = router;