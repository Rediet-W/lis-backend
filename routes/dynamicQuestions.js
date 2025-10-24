const express = require("express");
const router = express.Router();
const dynamicQuestionController = require("../controllers/dynamicQuestionController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/dynamic-questions - Get all dynamic questions
router.get("/", dynamicQuestionController.getAll);
// GET /api/dynamic-questions/test/:testId - Get questions by test ID
router.get("/test/:testId", dynamicQuestionController.getByTest);
// GET /api/dynamic-questions/:id - Get dynamic question by ID
router.get("/:id", dynamicQuestionController.getById);

// POST /api/dynamic-questions - Create new dynamic question (Admin only)
router.post("/", authorizeRoles("admin"), dynamicQuestionController.create);

// PUT /api/dynamic-questions/:id - Update dynamic question (Admin only)
router.put("/:id", authorizeRoles("admin"), dynamicQuestionController.update);

// DELETE /api/dynamic-questions/:id - Delete dynamic question (Admin only)
router.delete(
  "/:id",
  authorizeRoles("admin"),
  dynamicQuestionController.delete
);

module.exports = router;
