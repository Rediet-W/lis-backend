const TestResult = require("../models/TestResult");

const resultController = {
  getAllResults: async (req, res) => {
    try {
      const results = await TestResult.getAll();
      res.json({
        success: true,
        data: results,
        count: results.length,
      });
    } catch (error) {
      console.error("Get results error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch results",
      });
    }
  },

  getResultById: async (req, res) => {
    try {
      const result = await TestResult.getById(req.params.id);
      if (!result) {
        return res.status(404).json({
          success: false,
          error: "Result not found",
        });
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get result error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch result",
      });
    }
  },

  createResult: async (req, res) => {
    try {
      const {
        test_order_id,
        laboratorist_id,
        result_value,
        numeric_value,
        unit,
        comments,
        interpretation,
      } = req.body;

      if (!test_order_id || !laboratorist_id || result_value === undefined) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required fields: test_order_id, laboratorist_id, result_value",
        });
      }

      const resultId = await TestResult.create({
        test_order_id,
        laboratorist_id,
        result_value,
        numeric_value,
        unit,
        comments,
        interpretation,
      });

      res.status(201).json({
        success: true,
        message: "Test result created successfully",
        data: { result_id: resultId },
      });
    } catch (error) {
      console.error("Create result error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create result",
      });
    }
  },

  verifyResult: async (req, res) => {
    try {
      const resultId = req.params.id;
      const { verified_by } = req.body;

      if (!verified_by) {
        return res.status(400).json({
          success: false,
          error: "Verified by user ID is required",
        });
      }

      const verified = await TestResult.verify(resultId, verified_by);
      if (!verified) {
        return res.status(404).json({
          success: false,
          error: "Result not found",
        });
      }

      res.json({
        success: true,
        message: "Result verified successfully",
      });
    } catch (error) {
      console.error("Verify result error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to verify result",
      });
    }
  },

  getResultByOrder: async (req, res) => {
    try {
      const result = await TestResult.getByOrder(req.params.orderId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get result by order error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch result",
      });
    }
  },

  getResultsByPatient: async (req, res) => {
    try {
      const results = await TestResult.getByPatient(req.params.patientId);
      res.json({
        success: true,
        data: results,
        count: results.length,
      });
    } catch (error) {
      console.error("Get results by patient error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch results",
      });
    }
  },
};

module.exports = resultController;
