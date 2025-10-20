const express = require("express");
const router = express.Router();
const clinicController = require("../controllers/clinicController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/clinic - Get clinic settings
router.get("/", clinicController.get);

// POST /api/clinic - Create clinic settings (Admin only)
router.post("/", authorizeRoles("admin"), clinicController.create);

// PUT /api/clinic - Update clinic settings (Admin only)
router.put("/", authorizeRoles("admin"), clinicController.update);

module.exports = router;
