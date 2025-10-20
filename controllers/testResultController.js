const TestResult = require("../models/TestResult");
const ParameterResult = require("../models/ParameterResult");
const {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
} = require("../utils/responseUtils");
const { validateRequiredFields } = require("../utils/validationUtils");

const testResultController = {
  getAll: async (req, res) => {
    try {
      const { test_order_id, is_verified, status } = req.query;
      const filters = {};

      if (test_order_id) filters.test_order_id = test_order_id;
      if (is_verified !== undefined)
        filters.is_verified = is_verified === "true" ? 1 : 0;
      if (status) filters.status = status;

      const results = await TestResult.findAll(filters);
      successResponse(res, results);
    } catch (error) {
      errorResponse(res, "Failed to fetch test results");
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await TestResult.findById(id);

      if (!result) {
        return notFoundError(res, "Test result");
      }

      const parameterResults = await TestResult.getParameterResults(id);
      successResponse(res, { ...result, parameter_results: parameterResults });
    } catch (error) {
      errorResponse(res, "Failed to fetch test result");
    }
  },

  create: async (req, res) => {
    try {
      const {
        test_order_id,
        laboratorist_id,
        result_value,
        numeric_value,
        unit,
        status = "normal",
        comments,
        interpretation,
      } = req.body;

      const errors = validateRequiredFields({ test_order_id }, [
        "test_order_id",
      ]);
      if (errors.length > 0) {
        return validationError(res, errors);
      }

      // Check if result already exists for this test order
      const existingResult = await TestResult.findByTestOrderId(test_order_id);
      if (existingResult) {
        return errorResponse(
          res,
          "Test result already exists for this order",
          409
        );
      }

      const resultData = {
        test_order_id,
        laboratorist_id: laboratorist_id || req.user?.id,
        result_value,
        numeric_value,
        unit,
        status,
        comments,
        interpretation,
        is_verified: 0,
      };

      const newResult = await TestResult.create(resultData);
      successResponse(res, newResult, "Test result created successfully", 201);
    } catch (error) {
      errorResponse(res, "Failed to create test result");
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        result_value,
        numeric_value,
        unit,
        status,
        comments,
        interpretation,
      } = req.body;

      const existingResult = await TestResult.findById(id);
      if (!existingResult) {
        return notFoundError(res, "Test result");
      }

      // Don't allow updates if already verified
      if (existingResult.is_verified) {
        return errorResponse(res, "Cannot update verified test result", 403);
      }

      const updateData = {};
      if (result_value !== undefined) updateData.result_value = result_value;
      if (numeric_value !== undefined) updateData.numeric_value = numeric_value;
      if (unit !== undefined) updateData.unit = unit;
      if (status !== undefined) updateData.status = status;
      if (comments !== undefined) updateData.comments = comments;
      if (interpretation !== undefined)
        updateData.interpretation = interpretation;

      const updated = await TestResult.update(id, updateData);

      if (updated) {
        successResponse(
          res,
          { id, ...updateData },
          "Test result updated successfully"
        );
      } else {
        errorResponse(res, "Failed to update test result");
      }
    } catch (error) {
      errorResponse(res, "Failed to update test result");
    }
  },

  verify: async (req, res) => {
    try {
      const { id } = req.params;

      const existingResult = await TestResult.findById(id);
      if (!existingResult) {
        return notFoundError(res, "Test result");
      }

      if (existingResult.is_verified) {
        return errorResponse(res, "Test result is already verified", 409);
      }

      const verified = await TestResult.verifyResult(id, req.user?.id);

      if (verified) {
        successResponse(res, null, "Test result verified successfully");
      } else {
        errorResponse(res, "Failed to verify test result");
      }
    } catch (error) {
      errorResponse(res, "Failed to verify test result");
    }
  },

  getParameterResults: async (req, res) => {
    try {
      const { id } = req.params;

      const existingResult = await TestResult.findById(id);
      if (!existingResult) {
        return notFoundError(res, "Test result");
      }

      const parameterResults = await TestResult.getParameterResults(id);
      successResponse(res, parameterResults);
    } catch (error) {
      errorResponse(res, "Failed to fetch parameter results");
    }
  },
};

module.exports = testResultController;
