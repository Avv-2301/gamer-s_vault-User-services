const express = require("express");
const userRoutes = require('./app/auth');
const adminRoutes = require('./admin/adminRoutes');

const router = express.Router();

router.use("/", userRoutes);
router.use("/admin", adminRoutes);

module.exports = router;