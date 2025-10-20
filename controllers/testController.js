const Test = require("../models/Test");
const {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
} = require("../utils/responseUtils");
const { validateRequiredFields } = require("../utils/validationUtils");

const testController = {
  getAll: async (req, res) => {
    try {
      const { category_id, is_active } = req.query;
      const filters = {};

      if (category_id) filters.category_id = category_id;
      if (is_active !== undefined)
        filters.is_active = is_active === "true" ? 1 : 0;

      const tests = await Test.findAll(filters);
      successResponse(res, tests);
    } catch (error) {
      errorResponse(res, "Failed to fetch tests");
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const test = await Test.findById(id);

      if (!test) {
        return notFoundError(res, "Test");
      }

      const [parameters, referenceRanges, questions] = await Promise.all([
        Test.getParameters(id),
        Test.getReferenceRanges(id),
        Test.getDynamicQuestions(id),
      ]);

      successResponse(res, {
        ...test,
        parameters,
        reference_ranges: referenceRanges,
        dynamic_questions: questions,
      });
    } catch (error) {
      errorResponse(res, "Failed to fetch test");
    }
  },

  create: async (req, res) => {
    try {
      const {
        category_id,
        name,
        description,
        sample_type,
        sample_volume,
        tube_type,
        processing_time,
        linear_range,
        testing_modes,
        is_active = 1,
      } = req.body;

      const errors = validateRequiredFields(
        { category_id, name, sample_type },
        ["category_id", "name", "sample_type"]
      );
      if (errors.length > 0) {
        return validationError(res, errors);
      }

      const testData = {
        category_id,
        name,
        description,
        sample_type,
        sample_volume,
        tube_type,
        processing_time,
        linear_range,
        testing_modes,
        is_active: is_active ? 1 : 0,
      };

      const newTest = await Test.create(testData);
      successResponse(res, newTest, "Test created successfully", 201);
    } catch (error) {
      errorResponse(res, "Failed to create test");
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        category_id,
        name,
        description,
        sample_type,
        sample_volume,
        tube_type,
        processing_time,
        linear_range,
        testing_modes,
        is_active,
      } = req.body;

      const existingTest = await Test.findById(id);
      if (!existingTest) {
        return notFoundError(res, "Test");
      }

      const updateData = {};
      if (category_id !== undefined) updateData.category_id = category_id;
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (sample_type !== undefined) updateData.sample_type = sample_type;
      if (sample_volume !== undefined) updateData.sample_volume = sample_volume;
      if (tube_type !== undefined) updateData.tube_type = tube_type;
      if (processing_time !== undefined)
        updateData.processing_time = processing_time;
      if (linear_range !== undefined) updateData.linear_range = linear_range;
      if (testing_modes !== undefined) updateData.testing_modes = testing_modes;
      if (is_active !== undefined) updateData.is_active = is_active ? 1 : 0;

      const updated = await Test.update(id, updateData);

      if (updated) {
        successResponse(
          res,
          { id, ...updateData },
          "Test updated successfully"
        );
      } else {
        errorResponse(res, "Failed to update test");
      }
    } catch (error) {
      errorResponse(res, "Failed to update test");
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const existingTest = await Test.findById(id);
      if (!existingTest) {
        return notFoundError(res, "Test");
      }

      const deleted = await Test.delete(id);

      if (deleted) {
        successResponse(res, null, "Test deactivated successfully");
      } else {
        errorResponse(res, "Failed to deactivate test");
      }
    } catch (error) {
      errorResponse(res, "Failed to deactivate test");
    }
  },
};

module.exports = testController;
