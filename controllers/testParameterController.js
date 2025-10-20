const TestParameter = require("../models/TestParameter");
const {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
} = require("../utils/responseUtils");
const { validateRequiredFields } = require("../utils/validationUtils");

const testParameterController = {
  getAll: async (req, res) => {
    try {
      const { test_id } = req.query;
      const filters = {};

      if (test_id) filters.test_id = test_id;

      const parameters = await TestParameter.findAll(filters);
      successResponse(res, parameters);
    } catch (error) {
      errorResponse(res, "Failed to fetch test parameters");
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const parameter = await TestParameter.findById(id);

      if (!parameter) {
        return notFoundError(res, "Test parameter");
      }

      const referenceRanges = await TestParameter.getReferenceRanges(id);
      successResponse(res, { ...parameter, reference_ranges: referenceRanges });
    } catch (error) {
      errorResponse(res, "Failed to fetch test parameter");
    }
  },

  create: async (req, res) => {
    try {
      const { test_id, parameter_name, unit } = req.body;

      const errors = validateRequiredFields({ test_id, parameter_name }, [
        "test_id",
        "parameter_name",
      ]);
      if (errors.length > 0) {
        return validationError(res, errors);
      }

      const parameterData = { test_id, parameter_name, unit };
      const newParameter = await TestParameter.create(parameterData);

      successResponse(
        res,
        newParameter,
        "Test parameter created successfully",
        201
      );
    } catch (error) {
      errorResponse(res, "Failed to create test parameter");
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { parameter_name, unit } = req.body;

      const existingParameter = await TestParameter.findById(id);
      if (!existingParameter) {
        return notFoundError(res, "Test parameter");
      }

      const updateData = {};
      if (parameter_name !== undefined)
        updateData.parameter_name = parameter_name;
      if (unit !== undefined) updateData.unit = unit;

      const updated = await TestParameter.update(id, updateData);

      if (updated) {
        successResponse(
          res,
          { id, ...updateData },
          "Test parameter updated successfully"
        );
      } else {
        errorResponse(res, "Failed to update test parameter");
      }
    } catch (error) {
      errorResponse(res, "Failed to update test parameter");
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const existingParameter = await TestParameter.findById(id);
      if (!existingParameter) {
        return notFoundError(res, "Test parameter");
      }

      // Check if parameter has reference ranges
      const referenceRanges = await TestParameter.getReferenceRanges(id);
      if (referenceRanges.length > 0) {
        return errorResponse(
          res,
          "Cannot delete parameter with existing reference ranges",
          400
        );
      }

      const deleted = await TestParameter.delete(id);

      if (deleted) {
        successResponse(res, null, "Test parameter deleted successfully");
      } else {
        errorResponse(res, "Failed to delete test parameter");
      }
    } catch (error) {
      errorResponse(res, "Failed to delete test parameter");
    }
  },

  getByTest: async (req, res) => {
    try {
      const { testId } = req.params;
      const parameters = await TestParameter.getByTestId(testId);
      successResponse(res, parameters);
    } catch (error) {
      errorResponse(res, "Failed to fetch test parameters");
    }
  },
};

module.exports = testParameterController;
