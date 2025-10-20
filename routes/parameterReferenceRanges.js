const express = require("express");
const router = express.Router();
const parameterReferenceRangeController = require("../controllers/parameterReferenceRangeController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/reference-ranges - Get all reference ranges
router.get("/", parameterReferenceRangeController.getAll);

// GET /api/reference-ranges/:id - Get reference range by ID
router.get("/:id", parameterReferenceRangeController.getById);

// GET /api/reference-ranges/find - Find reference range by criteria
router.get("/find/criteria", parameterReferenceRangeController.findByCriteria);

// POST /api/reference-ranges - Create new reference range (Admin only)
router.post(
  "/",
  authorizeRoles("admin"),
  parameterReferenceRangeController.create
);

// PUT /api/reference-ranges/:id - Update reference range (Admin only)
router.put(
  "/:id",
  authorizeRoles("admin"),
  parameterReferenceRangeController.update
);

// DELETE /api/reference-ranges/:id - Delete reference range (Admin only)
router.delete(
  "/:id",
  authorizeRoles("admin"),
  parameterReferenceRangeController.delete
);

module.exports = router;
