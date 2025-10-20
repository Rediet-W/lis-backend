const ParameterResult = require("../models/ParameterResult");
const {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
} = require("../utils/responseUtils");
const { validateRequiredFields } = require("../utils/validationUtils");

const parameterResultController = {
  getAll: async (req, res) => {
    try {
      const { test_result_id, parameter_id } = req.query;
      const filters = {};

      if (test_result_id) filters.test_result_id = test_result_id;
      if (parameter_id) filters.parameter_id = parameter_id;

      const results = await ParameterResult.findAll(filters);
      successResponse(res, results);
    } catch (error) {
      errorResponse(res, "Failed to fetch parameter results");
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await ParameterResult.findById(id);

      if (!result) {
        return notFoundError(res, "Parameter result");
      }

      successResponse(res, result);
    } catch (error) {
      errorResponse(res, "Failed to fetch parameter result");
    }
  },

  create: async (req, res) => {
    try {
      const {
        test_result_id,
        parameter_id,
        result_value,
        string_value,
        unit,
        reference_min,
        reference_max,
        status = "normal",
      } = req.body;

      const errors = validateRequiredFields({ test_result_id, parameter_id }, [
        "test_result_id",
        "parameter_id",
      ]);
      if (errors.length > 0) {
        return validationError(res, errors);
      }

      const resultData = {
        test_result_id,
        parameter_id,
        result_value,
        string_value,
        unit,
        reference_min,
        reference_max,
        status,
      };

      const newResult = await ParameterResult.create(resultData);
      successResponse(
        res,
        newResult,
        "Parameter result created successfully",
        201
      );
    } catch (error) {
      errorResponse(res, "Failed to create parameter result");
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        result_value,
        string_value,
        unit,
        reference_min,
        reference_max,
        status,
      } = req.body;

      const existingResult = await ParameterResult.findById(id);
      if (!existingResult) {
        return notFoundError(res, "Parameter result");
      }

      const updateData = {};
      if (result_value !== undefined) updateData.result_value = result_value;
      if (string_value !== undefined) updateData.string_value = string_value;
      if (unit !== undefined) updateData.unit = unit;
      if (reference_min !== undefined) updateData.reference_min = reference_min;
      if (reference_max !== undefined) updateData.reference_max = reference_max;
      if (status !== undefined) updateData.status = status;

      const updated = await ParameterResult.update(id, updateData);

      if (updated) {
        successResponse(
          res,
          { id, ...updateData },
          "Parameter result updated successfully"
        );
      } else {
        errorResponse(res, "Failed to update parameter result");
      }
    } catch (error) {
      errorResponse(res, "Failed to update parameter result");
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const existingResult = await ParameterResult.findById(id);
      if (!existingResult) {
        return notFoundError(res, "Parameter result");
      }

      const deleted = await ParameterResult.delete(id);

      if (deleted) {
        successResponse(res, null, "Parameter result deleted successfully");
      } else {
        errorResponse(res, "Failed to delete parameter result");
      }
    } catch (error) {
      errorResponse(res, "Failed to delete parameter result");
    }
  },

  getByTestResult: async (req, res) => {
    try {
      const { testResultId } = req.params;
      const results = await ParameterResult.getByTestResultId(testResultId);
      successResponse(res, results);
    } catch (error) {
      errorResponse(res, "Failed to fetch parameter results");
    }
  },

  batchCreate: async (req, res) => {
    try {
      const { parameter_results } = req.body;

      if (!Array.isArray(parameter_results) || parameter_results.length === 0) {
        return validationError(res, ["parameter_results array is required"]);
      }

      // Validate each parameter result
      for (const result of parameter_results) {
        const errors = validateRequiredFields(result, [
          "test_result_id",
          "parameter_id",
        ]);
        if (errors.length > 0) {
          return validationError(res, errors);
        }
      }

      const createdResults = await ParameterResult.batchCreate(
        parameter_results
      );
      successResponse(
        res,
        createdResults,
        "Parameter results created successfully",
        201
      );
    } catch (error) {
      errorResponse(res, "Failed to create parameter results");
    }
  },
};

module.exports = parameterResultController;
