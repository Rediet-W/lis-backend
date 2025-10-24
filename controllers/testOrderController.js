const TestOrder = require("../models/TestOrder");
const TestResult = require("../models/TestResult");
const {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
} = require("../utils/responseUtils");
const { validateRequiredFields } = require("../utils/validationUtils");
const ALLOWED_PRIORITIES = ["normal", "urgent"];
const ALLOWED_SAMPLE_TYPES = ["serum", "plasma", "urine", "blood"];

const testOrderController = {
  getAll: async (req, res) => {
    try {
      const { status, visit_id, test_id, priority } = req.query;
      const filters = {};

      if (status) filters.status = status;
      if (visit_id) filters.visit_id = visit_id;
      if (test_id) filters.test_id = test_id;
      if (priority) filters.priority = priority;

      const orders = await TestOrder.findAll(filters);
      successResponse(res, orders);
    } catch (error) {
      errorResponse(res, "Failed to fetch test orders");
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await TestOrder.findById(id);

      if (!order) {
        return notFoundError(res, "Test order");
      }

      const results = await TestOrder.getResults(id);
      successResponse(res, { ...order, results });
    } catch (error) {
      errorResponse(res, "Failed to fetch test order");
    }
  },

  create: async (req, res) => {
    try {
      const {
        visit_id,
        test_id,
        status = "ordered",
        priority = "normal",
        dynamic_answers,
        ordered_by,
        sample_type,
      } = req.body;

      const errors = validateRequiredFields({ visit_id, test_id }, [
        "visit_id",
        "test_id",
      ]);
      if (errors.length > 0) {
        return validationError(res, errors);
      }

      let dynamicAnswersStr = null;
      if (dynamic_answers !== undefined && dynamic_answers !== null) {
        if (typeof dynamic_answers === "string") {
          try {
            JSON.parse(dynamic_answers); // validate
            dynamicAnswersStr = dynamic_answers;
          } catch {
            // fallback to empty object
            dynamicAnswersStr = "{}";
          }
        } else {
          dynamicAnswersStr = JSON.stringify(dynamic_answers);
        }
      }

      // Coerce enums
      const priorityVal = ALLOWED_PRIORITIES.includes(priority)
        ? priority
        : "normal";
      const sampleTypeVal = ALLOWED_SAMPLE_TYPES.includes(sample_type)
        ? sample_type
        : null; // set to null if not provided/invalid

      const orderData = {
        visit_id,
        test_id,
        status,
        priority: priorityVal,
        dynamic_answers: dynamicAnswersStr,
        ordered_by: ordered_by || null,
        ordered_at: new Date(),
        sample_type: sampleTypeVal,
      };

      const newOrder = await TestOrder.create(orderData);
      successResponse(res, newOrder, "Test order created successfully", 201);
    } catch (error) {
      errorResponse(res, "Failed to create test order");
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const existingOrder = await TestOrder.findById(id);
      if (!existingOrder) {
        return notFoundError(res, "Test order");
      }

      if (!status) {
        return validationError(res, ["Status is required"]);
      }

      let timestampField = null;
      switch (status) {
        case "sample_collected":
          timestampField = "sample_collected_at";
          break;
        case "completed":
          timestampField = "completed_at";
          break;
      }

      const updated = await TestOrder.updateStatus(id, status, timestampField);

      if (updated) {
        successResponse(
          res,
          { id, status },
          "Test order status updated successfully"
        );
      } else {
        errorResponse(res, "Failed to update test order status");
      }
    } catch (error) {
      errorResponse(res, "Failed to update test order status");
    }
  },

  getPending: async (req, res) => {
    try {
      const pendingOrders = await TestOrder.getPendingOrders();
      successResponse(res, pendingOrders);
    } catch (error) {
      errorResponse(res, "Failed to fetch pending orders");
    }
  },

  getResults: async (req, res) => {
    try {
      const { id } = req.params;

      const existingOrder = await TestOrder.findById(id);
      if (!existingOrder) {
        return notFoundError(res, "Test order");
      }

      const results = await TestOrder.getResults(id);
      successResponse(res, results);
    } catch (error) {
      errorResponse(res, "Failed to fetch test results");
    }
  },
};

module.exports = testOrderController;
