const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const {
  successResponse,
  errorResponse,
  validationError,
  unauthorizedError,
} = require("../utils/responseUtils");
const {
  validateRequiredFields,
  validateEmail,
} = require("../utils/validationUtils");
const jwt = require("jsonwebtoken");

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "24h" }
  );
};

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const errors = validateRequiredFields({ email, password }, [
        "email",
        "password",
      ]);
      if (errors.length > 0) {
        return validationError(res, errors);
      }

      if (!validateEmail(email)) {
        return validationError(res, ["Invalid email format"]);
      }

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return unauthorizedError(res, "Invalid credentials");
      }

      // Check if user is active
      if (!user.is_active) {
        return unauthorizedError(res, "Account is deactivated");
      }

      // Verify password
      const isPasswordValid = await User.verifyPassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        return unauthorizedError(res, "Invalid credentials");
      }

      // Generate token
      const token = generateToken(user.id, user.role);

      // Log activity
      await ActivityLog.logActivity(
        user.id,
        "login",
        `User logged in successfully`
      );

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;

      successResponse(
        res,
        {
          user: userWithoutPassword,
          token,
        },
        "Login successful"
      );
    } catch (error) {
      errorResponse(res, "Login failed");
    }
  },

  register: async (req, res) => {
    try {
      const { username, email, password, role, full_name, phone } = req.body;

      const errors = validateRequiredFields(
        { username, email, password, role, full_name },
        ["username", "email", "password", "role", "full_name"]
      );
      if (errors.length > 0) {
        return validationError(res, errors);
      }

      if (!validateEmail(email)) {
        return validationError(res, ["Invalid email format"]);
      }

      // Check if user already exists
      const existingUserByEmail = await User.findByEmail(email);
      if (existingUserByEmail) {
        return errorResponse(res, "User with this email already exists", 409);
      }

      const existingUserByUsername = await User.findByUsername(username);
      if (existingUserByUsername) {
        return errorResponse(
          res,
          "User with this username already exists",
          409
        );
      }

      const userData = {
        username,
        email,
        password,
        role,
        full_name,
        phone,
        is_active: 1,
      };

      const newUser = await User.create(userData);

      // Log activity
      await ActivityLog.logActivity(
        newUser.id,
        "register",
        `User registered with role: ${role}`
      );

      successResponse(res, newUser, "User registered successfully", 201);
    } catch (error) {
      errorResponse(res, "Registration failed");
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return notFoundError(res, "User");
      }

      successResponse(res, user);
    } catch (error) {
      errorResponse(res, "Failed to fetch profile");
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { full_name, phone } = req.body;

      const updateData = {};
      if (full_name !== undefined) updateData.full_name = full_name;
      if (phone !== undefined) updateData.phone = phone;

      const updated = await User.update(req.user.userId, updateData);

      if (updated) {
        const updatedUser = await User.findById(req.user.userId);

        // Log activity
        await ActivityLog.logActivity(
          req.user.userId,
          "update_profile",
          `User updated their profile`
        );

        successResponse(res, updatedUser, "Profile updated successfully");
      } else {
        errorResponse(res, "Failed to update profile");
      }
    } catch (error) {
      errorResponse(res, "Failed to update profile");
    }
  },

  changePassword: async (req, res) => {
    try {
      const { current_password, new_password } = req.body;

      const errors = validateRequiredFields(
        { current_password, new_password },
        ["current_password", "new_password"]
      );
      if (errors.length > 0) {
        return validationError(res, errors);
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        return notFoundError(res, "User");
      }

      // Verify current password
      const isCurrentPasswordValid = await User.verifyPassword(
        current_password,
        user.password
      );
      if (!isCurrentPasswordValid) {
        return unauthorizedError(res, "Current password is incorrect");
      }

      // Update password
      const updated = await User.update(req.user.userId, {
        password: new_password,
      });

      if (updated) {
        // Log activity
        await ActivityLog.logActivity(
          req.user.userId,
          "change_password",
          `User changed their password`
        );

        successResponse(res, null, "Password changed successfully");
      } else {
        errorResponse(res, "Failed to change password");
      }
    } catch (error) {
      errorResponse(res, "Failed to change password");
    }
  },
};

module.exports = authController;
