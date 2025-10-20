const ParameterReferenceRange = require("../models/ParameterReferenceRange");
const {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
} = require("../utils/responseUtils");
const {
  validateRequiredFields,
  validateNumericRange,
} = require("../utils/validationUtils");

const parameterReferenceRangeController = {
  getAll: async (req, res) => {
    try {
      const { parameter_id } = req.query;
      const filters = {};

      if (parameter_id) filters.parameter_id = parameter_id;

      const ranges = await ParameterReferenceRange.findAll(filters);
      successResponse(res, ranges);
    } catch (error) {
      errorResponse(res, "Failed to fetch reference ranges");
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const range = await ParameterReferenceRange.findById(id);

      if (!range) {
        return notFoundError(res, "Reference range");
      }

      successResponse(res, range);
    } catch (error) {
      errorResponse(res, "Failed to fetch reference range");
    }
  },

  create: async (req, res) => {
    try {
      const {
        parameter_id,
        sample_type,
        gender = "both",
        min_age,
        max_age,
        unit,
        min_value,
        max_value,
        critical_low,
        critical_high,
        conditions,
      } = req.body;

      const errors = validateRequiredFields({ parameter_id }, ["parameter_id"]);
      if (errors.length > 0) {
        return validationError(res, errors);
      }

      // Validate age range
      if (min_age !== null && max_age !== null && min_age > max_age) {
        return validationError(res, ["Min age cannot be greater than max age"]);
      }

      // Validate value range
      if (min_value !== null && max_value !== null && min_value > max_value) {
        return validationError(res, [
          "Min value cannot be greater than max value",
        ]);
      }

      const rangeData = {
        parameter_id,
        sample_type,
        gender,
        min_age: min_age || null,
        max_age: max_age || null,
        unit,
        min_value,
        max_value,
        critical_low,
        critical_high,
        conditions,
      };

      const newRange = await ParameterReferenceRange.create(rangeData);
      successResponse(
        res,
        newRange,
        "Reference range created successfully",
        201
      );
    } catch (error) {
      errorResponse(res, "Failed to create reference range");
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        sample_type,
        gender,
        min_age,
        max_age,
        unit,
        min_value,
        max_value,
        critical_low,
        critical_high,
        conditions,
      } = req.body;

      const existingRange = await ParameterReferenceRange.findById(id);
      if (!existingRange) {
        return notFoundError(res, "Reference range");
      }

      // Validate age range
      if (min_age !== undefined && max_age !== undefined && min_age > max_age) {
        return validationError(res, ["Min age cannot be greater than max age"]);
      }

      // Validate value range
      if (
        min_value !== undefined &&
        max_value !== undefined &&
        min_value > max_value
      ) {
        return validationError(res, [
          "Min value cannot be greater than max value",
        ]);
      }

      const updateData = {};
      if (sample_type !== undefined) updateData.sample_type = sample_type;
      if (gender !== undefined) updateData.gender = gender;
      if (min_age !== undefined) updateData.min_age = min_age;
      if (max_age !== undefined) updateData.max_age = max_age;
      if (unit !== undefined) updateData.unit = unit;
      if (min_value !== undefined) updateData.min_value = min_value;
      if (max_value !== undefined) updateData.max_value = max_value;
      if (critical_low !== undefined) updateData.critical_low = critical_low;
      if (critical_high !== undefined) updateData.critical_high = critical_high;
      if (conditions !== undefined) updateData.conditions = conditions;

      const updated = await ParameterReferenceRange.update(id, updateData);

      if (updated) {
        successResponse(
          res,
          { id, ...updateData },
          "Reference range updated successfully"
        );
      } else {
        errorResponse(res, "Failed to update reference range");
      }
    } catch (error) {
      errorResponse(res, "Failed to update reference range");
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const existingRange = await ParameterReferenceRange.findById(id);
      if (!existingRange) {
        return notFoundError(res, "Reference range");
      }

      const deleted = await ParameterReferenceRange.delete(id);

      if (deleted) {
        successResponse(res, null, "Reference range deleted successfully");
      } else {
        errorResponse(res, "Failed to delete reference range");
      }
    } catch (error) {
      errorResponse(res, "Failed to delete reference range");
    }
  },

  findByCriteria: async (req, res) => {
    try {
      const { parameter_id, gender = "both", age } = req.query;

      if (!parameter_id) {
        return validationError(res, ["Parameter ID is required"]);
      }

      const range = await ParameterReferenceRange.findByParameter(
        parameter_id,
        gender,
        age ? parseInt(age) : null
      );

      successResponse(res, range);
    } catch (error) {
      errorResponse(res, "Failed to find reference range");
    }
  },
};

module.exports = parameterReferenceRangeController;
