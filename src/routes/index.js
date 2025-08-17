const express = require("express");
const userRoutes = require('./app/auth')

const router = express.Router();

router.use("/users", userRoutes);

module.exports = router;