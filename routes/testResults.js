const express = require("express");
const router = express.Router();
const testResultController = require("../controllers/testResultController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/test-results - Get all test results
router.get("/", testResultController.getAll);

// GET /api/test-results/:id - Get test result by ID
router.get("/:id", testResultController.getById);

// GET /api/test-results/:id/parameters - Get test result parameters
router.get("/:id/parameters", testResultController.getParameterResults);

// POST /api/test-results - Create new test result
router.post(
  "/",
  authorizeRoles("admin", "laboratorist"),
  testResultController.create
);

// PUT /api/test-results/:id - Update test result
router.put(
  "/:id",
  authorizeRoles("admin", "laboratorist"),
  testResultController.update
);

// PATCH /api/test-results/:id/verify - Verify test result
router.patch(
  "/:id/verify",
  authorizeRoles("admin", "laboratorist"),
  testResultController.verify
);

module.exports = router;
