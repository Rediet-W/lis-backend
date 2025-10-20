const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/tests - Get all tests
router.get("/", testController.getAll);

// GET /api/tests/:id - Get test by ID
router.get("/:id", testController.getById);

// POST /api/tests - Create new test (Admin only)
router.post("/", authorizeRoles("admin"), testController.create);

// PUT /api/tests/:id - Update test (Admin only)
router.put("/:id", authorizeRoles("admin"), testController.update);

// DELETE /api/tests/:id - Deactivate test (Admin only)
router.delete("/:id", authorizeRoles("admin"), testController.delete);

module.exports = router;
