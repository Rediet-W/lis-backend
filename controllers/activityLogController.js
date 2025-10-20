const ActivityLog = require("../models/ActivityLog");
const {
  successResponse,
  errorResponse,
  notFoundError,
} = require("../utils/responseUtils");

const activityLogController = {
  getAll: async (req, res) => {
    try {
      const { user_id, action } = req.query;
      const filters = {};

      if (user_id) filters.user_id = user_id;
      if (action) filters.action = action;

      const logs = await ActivityLog.findAll(filters);
      successResponse(res, logs);
    } catch (error) {
      errorResponse(res, "Failed to fetch activity logs");
    }
  },

  getRecent: async (req, res) => {
    try {
      const { limit = 100 } = req.query;
      const logs = await ActivityLog.getRecentActivities(parseInt(limit));
      successResponse(res, logs);
    } catch (error) {
      errorResponse(res, "Failed to fetch recent activities");
    }
  },

  getUserActivities: async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;

      const logs = await ActivityLog.getUserActivities(userId, parseInt(limit));
      successResponse(res, logs);
    } catch (error) {
      errorResponse(res, "Failed to fetch user activities");
    }
  },

  logActivity: async (req, res) => {
    try {
      const { user_id, action, description } = req.body;

      if (!user_id || !action) {
        return errorResponse(res, "User ID and action are required", 400);
      }

      const log = await ActivityLog.logActivity(user_id, action, description);
      successResponse(res, log, "Activity logged successfully", 201);
    } catch (error) {
      errorResponse(res, "Failed to log activity");
    }
  },
};

module.exports = activityLogController;
