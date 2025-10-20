const TestCategory = require("../models/TestCategory");
const {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
} = require("../utils/responseUtils");
const { validateRequiredFields } = require("../utils/validationUtils");

const testCategoryController = {
  getAll: async (req, res) => {
    try {
      const categories = await TestCategory.findAll();
      successResponse(res, categories);
    } catch (error) {
      errorResponse(res, "Failed to fetch test categories");
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await TestCategory.findById(id);

      if (!category) {
        return notFoundError(res, "Test category");
      }

      const tests = await TestCategory.getTests(id);
      successResponse(res, { ...category, tests });
    } catch (error) {
      errorResponse(res, "Failed to fetch test category");
    }
  },

  create: async (req, res) => {
    try {
      const { name, description } = req.body;

      const errors = validateRequiredFields({ name }, ["name"]);
      if (errors.length > 0) {
        return validationError(res, errors);
      }

      const categoryData = { name, description };
      const newCategory = await TestCategory.create(categoryData);

      successResponse(
        res,
        newCategory,
        "Test category created successfully",
        201
      );
    } catch (error) {
      errorResponse(res, "Failed to create test category");
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const existingCategory = await TestCategory.findById(id);
      if (!existingCategory) {
        return notFoundError(res, "Test category");
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;

      const updated = await TestCategory.update(id, updateData);

      if (updated) {
        successResponse(
          res,
          { id, ...updateData },
          "Test category updated successfully"
        );
      } else {
        errorResponse(res, "Failed to update test category");
      }
    } catch (error) {
      errorResponse(res, "Failed to update test category");
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const existingCategory = await TestCategory.findById(id);
      if (!existingCategory) {
        return notFoundError(res, "Test category");
      }

      // Check if category has tests
      const tests = await TestCategory.getTests(id);
      if (tests.length > 0) {
        return errorResponse(
          res,
          "Cannot delete category with existing tests",
          400
        );
      }

      const deleted = await TestCategory.delete(id);

      if (deleted) {
        successResponse(res, null, "Test category deleted successfully");
      } else {
        errorResponse(res, "Failed to delete test category");
      }
    } catch (error) {
      errorResponse(res, "Failed to delete test category");
    }
  },
};

module.exports = testCategoryController;
