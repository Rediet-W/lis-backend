const express = require("express");
const router = express.Router();
const visitController = require("../controllers/visitController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/visits - Get all visits
router.get("/", visitController.getAll);

// GET /api/visits/:id - Get visit by ID
router.get("/:id", visitController.getById);

// GET /api/visits/:id/test-orders - Get visit test orders
router.get("/:id/test-orders", visitController.getTestOrders);

// POST /api/visits - Create new visit
router.post(
  "/",
  authorizeRoles("admin", "receptionist"),
  visitController.create
);

// PUT /api/visits/:id - Update visit
router.put(
  "/:id",
  authorizeRoles("admin", "receptionist"),
  visitController.update
);

// PATCH /api/visits/:id/status - Update visit status
router.patch(
  "/:id/status",
  authorizeRoles("admin", "receptionist", "laboratorist"),
  visitController.updateStatus
);

module.exports = router;
