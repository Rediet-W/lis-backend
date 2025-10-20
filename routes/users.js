const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/users - Get all users (Admin only)
router.get("/", authorizeRoles("admin"), userController.getAll);

// GET /api/users/laboratorists - Get all laboratorists
router.get("/laboratorists", userController.getLaboratorists);

// GET /api/users/:id - Get user by ID
router.get("/:id", userController.getById);

// POST /api/users - Create new user (Admin only)
router.post("/", authorizeRoles("admin"), userController.create);

// PUT /api/users/:id - Update user (Admin only)
router.put("/:id", authorizeRoles("admin"), userController.update);

// PATCH /api/users/:id/deactivate - Deactivate user (Admin only)
router.patch(
  "/:id/deactivate",
  authorizeRoles("admin"),
  userController.deactivate
);

// PATCH /api/users/:id/activate - Activate user (Admin only)
router.patch("/:id/activate", authorizeRoles("admin"), userController.activate);

module.exports = router;
