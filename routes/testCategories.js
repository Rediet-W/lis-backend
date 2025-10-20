const express = require("express");
const router = express.Router();
const testCategoryController = require("../controllers/testCategoryController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/test-categories - Get all test categories
router.get("/", testCategoryController.getAll);

// GET /api/test-categories/:id - Get test category by ID
router.get("/:id", testCategoryController.getById);

// POST /api/test-categories - Create new test category (Admin only)
router.post("/", authorizeRoles("admin"), testCategoryController.create);

// PUT /api/test-categories/:id - Update test category (Admin only)
router.put("/:id", authorizeRoles("admin"), testCategoryController.update);

// DELETE /api/test-categories/:id - Delete test category (Admin only)
router.delete("/:id", authorizeRoles("admin"), testCategoryController.delete);

module.exports = router;
