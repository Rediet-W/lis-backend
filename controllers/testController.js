const Test = require("../models/Test");

const testController = {
  getAllTests: async (req, res) => {
    try {
      const tests = await Test.getAll();
      res.json({
        success: true,
        data: tests,
        count: tests.length,
      });
    } catch (error) {
      console.error("Get tests error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch tests",
      });
    }
  },

  getTestCategories: async (req, res) => {
    try {
      const categories = await Test.getCategories();
      res.json({
        success: true,
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      console.error("Get test categories error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch test categories",
      });
    }
  },

  getTestById: async (req, res) => {
    try {
      const test = await Test.getById(req.params.id);
      if (!test) {
        return res.status(404).json({
          success: false,
          error: "Test not found",
        });
      }

      res.json({
        success: true,
        data: test,
      });
    } catch (error) {
      console.error("Get test error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch test",
      });
    }
  },

  getTestReferenceRanges: async (req, res) => {
    try {
      const ranges = await Test.getReferenceRanges(req.params.id);
      res.json({
        success: true,
        data: ranges,
        count: ranges.length,
      });
    } catch (error) {
      console.error("Get test ranges error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch test reference ranges",
      });
    }
  },

  getTestQuestions: async (req, res) => {
    try {
      const questions = await Test.getDynamicQuestions(req.params.id);
      res.json({
        success: true,
        data: questions,
        count: questions.length,
      });
    } catch (error) {
      console.error("Get test questions error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch test questions",
      });
    }
  },
};

module.exports = testController;
