const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Authentication routes
router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/me", authController.getCurrentUser);

module.exports = router;
