const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

// POST /api/auth/login - User login
router.post("/login", authController.login);

// POST /api/auth/register - User registration (Admin only)
router.post("/register", authController.register);

// GET /api/auth/profile - Get user profile
router.get("/profile", authenticateToken, authController.getProfile);

// PUT /api/auth/profile - Update user profile
router.put("/profile", authenticateToken, authController.updateProfile);

// PUT /api/auth/change-password - Change password
router.put(
  "/change-password",
  authenticateToken,
  authController.changePassword
);

module.exports = router;
