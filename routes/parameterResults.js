const express = require("express");
const router = express.Router();
const parameterResultController = require("../controllers/parameterResultController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/parameter-results - Get all parameter results
router.get("/", parameterResultController.getAll);

// GET /api/parameter-results/:id - Get parameter result by ID
router.get("/:id", parameterResultController.getById);

// GET /api/parameter-results/test-result/:testResultId - Get results by test result ID
router.get(
  "/test-result/:testResultId",
  parameterResultController.getByTestResult
);

// POST /api/parameter-results - Create new parameter result
router.post(
  "/",
  authorizeRoles("admin", "laboratorist"),
  parameterResultController.create
);

// POST /api/parameter-results/batch - Create multiple parameter results
router.post(
  "/batch",
  authorizeRoles("admin", "laboratorist"),
  parameterResultController.batchCreate
);

// PUT /api/parameter-results/:id - Update parameter result
router.put(
  "/:id",
  authorizeRoles("admin", "laboratorist"),
  parameterResultController.update
);

// DELETE /api/parameter-results/:id - Delete parameter result
router.delete(
  "/:id",
  authorizeRoles("admin", "laboratorist"),
  parameterResultController.delete
);

module.exports = router;
