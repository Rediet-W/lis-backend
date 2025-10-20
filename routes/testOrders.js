const express = require("express");
const router = express.Router();
const testOrderController = require("../controllers/testOrderController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/test-orders - Get all test orders
router.get("/", testOrderController.getAll);

// GET /api/test-orders/pending - Get pending test orders
router.get("/pending", testOrderController.getPending);

// GET /api/test-orders/:id - Get test order by ID
router.get("/:id", testOrderController.getById);

// GET /api/test-orders/:id/results - Get test order results
router.get("/:id/results", testOrderController.getResults);

// POST /api/test-orders - Create new test order
router.post(
  "/",
  authorizeRoles("admin", "receptionist"),
  testOrderController.create
);

// PATCH /api/test-orders/:id/status - Update test order status
router.patch(
  "/:id/status",
  authorizeRoles("admin", "receptionist", "laboratorist"),
  testOrderController.updateStatus
);

module.exports = router;
