const express = require("express");
const router = express.Router();
const testParameterController = require("../controllers/testParameterController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/test-parameters - Get all test parameters
router.get("/", testParameterController.getAll);

// GET /api/test-parameters/:id - Get test parameter by ID
router.get("/:id", testParameterController.getById);

// GET /api/test-parameters/test/:testId - Get parameters by test ID
router.get("/test/:testId", testParameterController.getByTest);

// POST /api/test-parameters - Create new test parameter (Admin only)
router.post("/", authorizeRoles("admin"), testParameterController.create);

// PUT /api/test-parameters/:id - Update test parameter (Admin only)
router.put("/:id", authorizeRoles("admin"), testParameterController.update);

// DELETE /api/test-parameters/:id - Delete test parameter (Admin only)
router.delete("/:id", authorizeRoles("admin"), testParameterController.delete);

module.exports = router;
