const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
} = require("../utils/responseUtils");
const {
  validateRequiredFields,
  validateEmail,
  validatePhone,
} = require("../utils/validationUtils");

const userController = {
  getAll: async (req, res) => {
    try {
      const { role, is_active } = req.query;
      const filters = {};

      if (role) filters.role = role;
      if (is_active !== undefined)
        filters.is_active = is_active === "true" ? 1 : 0;

      const users = await User.findAll(filters);
      successResponse(res, users);
    } catch (error) {
      errorResponse(res, "Failed to fetch users");
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return notFoundError(res, "User");
      }

      successResponse(res, user);
    } catch (error) {
      errorResponse(res, "Failed to fetch user");
    }
  },

  create: async (req, res) => {
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

      if (phone && !validatePhone(phone)) {
        return validationError(res, ["Invalid phone number format"]);
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
        req.user.userId,
        "user_create",
        `Created user: ${newUser.full_name} (${newUser.role})`
      );

      successResponse(res, newUser, "User created successfully", 201);
    } catch (error) {
      errorResponse(res, "Failed to create user");
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, role, full_name, phone, is_active } = req.body;

      const existingUser = await User.findById(id);
      if (!existingUser) {
        return notFoundError(res, "User");
      }

      // Validate email if provided
      if (email && !validateEmail(email)) {
        return validationError(res, ["Invalid email format"]);
      }

      // Validate phone if provided
      if (phone && !validatePhone(phone)) {
        return validationError(res, ["Invalid phone number format"]);
      }

      const updateData = {};
      if (username !== undefined) updateData.username = username;
      if (email !== undefined) updateData.email = email;
      if (role !== undefined) updateData.role = role;
      if (full_name !== undefined) updateData.full_name = full_name;
      if (phone !== undefined) updateData.phone = phone;
      if (is_active !== undefined) updateData.is_active = is_active ? 1 : 0;

      // Check for duplicate email
      if (email && email !== existingUser.email) {
        const userWithEmail = await User.findByEmail(email);
        if (userWithEmail && userWithEmail.id !== parseInt(id)) {
          return errorResponse(
            res,
            "Another user with this email already exists",
            409
          );
        }
      }

      // Check for duplicate username
      if (username && username !== existingUser.username) {
        const userWithUsername = await User.findByUsername(username);
        if (userWithUsername && userWithUsername.id !== parseInt(id)) {
          return errorResponse(
            res,
            "Another user with this username already exists",
            409
          );
        }
      }

      const updated = await User.update(id, updateData);

      if (updated) {
        // Log activity
        await ActivityLog.logActivity(
          req.user.userId,
          "user_update",
          `Updated user: ${full_name || existingUser.full_name}`
        );

        successResponse(
          res,
          { id, ...updateData },
          "User updated successfully"
        );
      } else {
        errorResponse(res, "Failed to update user");
      }
    } catch (error) {
      errorResponse(res, "Failed to update user");
    }
  },

  deactivate: async (req, res) => {
    try {
      const { id } = req.params;

      const existingUser = await User.findById(id);
      if (!existingUser) {
        return notFoundError(res, "User");
      }

      const deactivated = await User.deactivate(id);

      if (deactivated) {
        // Log activity
        await ActivityLog.logActivity(
          req.user.userId,
          "user_deactivate",
          `Deactivated user: ${existingUser.full_name}`
        );

        successResponse(res, null, "User deactivated successfully");
      } else {
        errorResponse(res, "Failed to deactivate user");
      }
    } catch (error) {
      errorResponse(res, "Failed to deactivate user");
    }
  },

  activate: async (req, res) => {
    try {
      const { id } = req.params;

      const existingUser = await User.findById(id);
      if (!existingUser) {
        return notFoundError(res, "User");
      }

      const activated = await User.activate(id);

      if (activated) {
        // Log activity
        await ActivityLog.logActivity(
          req.user.userId,
          "user_activate",
          `Activated user: ${existingUser.full_name}`
        );

        successResponse(res, null, "User activated successfully");
      } else {
        errorResponse(res, "Failed to activate user");
      }
    } catch (error) {
      errorResponse(res, "Failed to activate user");
    }
  },

  getLaboratorists: async (req, res) => {
    try {
      const laboratorists = await User.getLaboratorists();
      successResponse(res, laboratorists);
    } catch (error) {
      errorResponse(res, "Failed to fetch laboratorists");
    }
  },
};

module.exports = userController;
