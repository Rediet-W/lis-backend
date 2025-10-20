const express = require("express");
const router = express.Router();
const activityLogController = require("../controllers/activityLogController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/activity-logs - Get all activity logs (Admin only)
router.get("/", authorizeRoles("admin"), activityLogController.getAll);

// GET /api/activity-logs/recent - Get recent activities
router.get("/recent", activityLogController.getRecent);

// GET /api/activity-logs/user/:userId - Get user activities
router.get("/user/:userId", activityLogController.getUserActivities);

// POST /api/activity-logs - Log activity
router.post("/", activityLogController.logActivity);

module.exports = router;
