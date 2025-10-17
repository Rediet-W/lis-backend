const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authController = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: "Username and password are required",
        });
      }

      // Find user by username
      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          error: "Account is deactivated",
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
      }

      // Generate token
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          role: user.role,
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            full_name: user.full_name,
            phone: user.phone,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        error: "Login failed",
      });
    }
  },

  register: async (req, res) => {
    try {
      const { username, email, password, role, full_name, phone } = req.body;

      // Validation
      if (!username || !email || !password || !role || !full_name) {
        return res.status(400).json({
          success: false,
          error: "All fields are required",
        });
      }

      // Check if user already exists
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Username already exists",
        });
      }

      // Create new user
      const userId = await User.create({
        username,
        email,
        password,
        role,
        full_name,
        phone,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: { user_id: userId },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        error: "Registration failed",
      });
    }
  },

  getCurrentUser: async (req, res) => {
    try {
      // This would typically use middleware to extract user from JWT
      // For now, we'll return a simple response
      res.json({
        success: true,
        message: "Current user endpoint - implement JWT middleware",
      });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get current user",
      });
    }
  },
};

module.exports = authController;
