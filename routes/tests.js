const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");

// Test routes
router.get("/", testController.getAllTests);
router.get("/categories", testController.getTestCategories);
router.get("/:id", testController.getTestById);
router.get("/:id/ranges", testController.getTestReferenceRanges);
router.get("/:id/questions", testController.getTestQuestions);

module.exports = router;
