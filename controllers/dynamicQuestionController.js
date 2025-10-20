const DynamicQuestion = require("../models/DynamicQuestion");
const {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
} = require("../utils/responseUtils");
const { validateRequiredFields } = require("../utils/validationUtils");

const dynamicQuestionController = {
  getAll: async (req, res) => {
    try {
      const { test_id } = req.query;
      const filters = {};

      if (test_id) filters.test_id = test_id;

      const questions = await DynamicQuestion.findAll(filters);
      successResponse(res, questions);
    } catch (error) {
      errorResponse(res, "Failed to fetch dynamic questions");
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const question = await DynamicQuestion.findById(id);

      if (!question) {
        return notFoundError(res, "Dynamic question");
      }

      successResponse(res, question);
    } catch (error) {
      errorResponse(res, "Failed to fetch dynamic question");
    }
  },

  create: async (req, res) => {
    try {
      const {
        test_id,
        question_text,
        field_type,
        options,
        is_required = false,
      } = req.body;

      const errors = validateRequiredFields(
        { test_id, question_text, field_type },
        ["test_id", "question_text", "field_type"]
      );
      if (errors.length > 0) {
        return validationError(res, errors);
      }

      // Validate field type
      const validFieldTypes = ["checkbox", "radio", "dropdown", "text"];
      if (!validFieldTypes.includes(field_type)) {
        return validationError(res, [
          `Invalid field type. Must be one of: ${validFieldTypes.join(", ")}`,
        ]);
      }

      // Validate options for non-text fields
      if (
        field_type !== "text" &&
        (!options || !Array.isArray(options) || options.length === 0)
      ) {
        return validationError(res, [
          "Options are required for non-text field types",
        ]);
      }

      const questionData = {
        test_id,
        question_text,
        field_type,
        options: options || [],
        is_required: is_required ? 1 : 0,
      };

      const newQuestion = await DynamicQuestion.create(questionData);
      successResponse(
        res,
        newQuestion,
        "Dynamic question created successfully",
        201
      );
    } catch (error) {
      errorResponse(res, "Failed to create dynamic question");
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { question_text, field_type, options, is_required } = req.body;

      const existingQuestion = await DynamicQuestion.findById(id);
      if (!existingQuestion) {
        return notFoundError(res, "Dynamic question");
      }

      const updateData = {};
      if (question_text !== undefined) updateData.question_text = question_text;
      if (field_type !== undefined) updateData.field_type = field_type;
      if (options !== undefined) updateData.options = options;
      if (is_required !== undefined)
        updateData.is_required = is_required ? 1 : 0;

      // Validate field type if provided
      if (field_type) {
        const validFieldTypes = ["checkbox", "radio", "dropdown", "text"];
        if (!validFieldTypes.includes(field_type)) {
          return validationError(res, [
            `Invalid field type. Must be one of: ${validFieldTypes.join(", ")}`,
          ]);
        }
      }

      // Validate options for non-text fields
      if (
        field_type &&
        field_type !== "text" &&
        options &&
        (!Array.isArray(options) || options.length === 0)
      ) {
        return validationError(res, [
          "Options are required for non-text field types",
        ]);
      }

      const updated = await DynamicQuestion.update(id, updateData);

      if (updated) {
        successResponse(
          res,
          { id, ...updateData },
          "Dynamic question updated successfully"
        );
      } else {
        errorResponse(res, "Failed to update dynamic question");
      }
    } catch (error) {
      errorResponse(res, "Failed to update dynamic question");
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const existingQuestion = await DynamicQuestion.findById(id);
      if (!existingQuestion) {
        return notFoundError(res, "Dynamic question");
      }

      const deleted = await DynamicQuestion.delete(id);

      if (deleted) {
        successResponse(res, null, "Dynamic question deleted successfully");
      } else {
        errorResponse(res, "Failed to delete dynamic question");
      }
    } catch (error) {
      errorResponse(res, "Failed to delete dynamic question");
    }
  },

  getByTest: async (req, res) => {
    try {
      const { testId } = req.params;
      const questions = await DynamicQuestion.getByTestId(testId);
      successResponse(res, questions);
    } catch (error) {
      errorResponse(res, "Failed to fetch dynamic questions");
    }
  },
};

module.exports = dynamicQuestionController;
