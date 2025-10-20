const Visit = require("../models/Visit");
const TestOrder = require("../models/TestOrder");
const {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
} = require("../utils/responseUtils");
const { validateRequiredFields } = require("../utils/validationUtils");

const visitController = {
  getAll: async (req, res) => {
    try {
      const { status, patient_id, date } = req.query;
      const filters = {};

      if (status) filters.status = status;
      if (patient_id) filters.patient_id = patient_id;
      if (date) filters.visit_date = date;

      const visits = await Visit.findAll(filters);
      successResponse(res, visits);
    } catch (error) {
      errorResponse(res, "Failed to fetch visits");
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const visit = await Visit.findById(id);

      if (!visit) {
        return notFoundError(res, "Visit");
      }

      const testOrders = await Visit.getTestOrders(id);
      successResponse(res, { ...visit, test_orders: testOrders });
    } catch (error) {
      errorResponse(res, "Failed to fetch visit");
    }
  },

  create: async (req, res) => {
    try {
      const {
        patient_id,
        receptionist_id,
        visit_date,
        visit_time,
        status = "registered",
        priority = "routine",
      } = req.body;

      const errors = validateRequiredFields({ patient_id, visit_date }, [
        "patient_id",
        "visit_date",
      ]);
      if (errors.length > 0) {
        return validationError(res, errors);
      }

      const visitData = {
        patient_id,
        receptionist_id: receptionist_id || req.user?.id, // Use authenticated user if not provided
        visit_date,
        visit_time: visit_time || "08:00:00",
        status,
        priority,
      };

      const newVisit = await Visit.create(visitData);
      successResponse(res, newVisit, "Visit created successfully", 201);
    } catch (error) {
      errorResponse(res, "Failed to create visit");
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, priority, visit_date, visit_time } = req.body;

      const existingVisit = await Visit.findById(id);
      if (!existingVisit) {
        return notFoundError(res, "Visit");
      }

      const updateData = {};
      if (status !== undefined) updateData.status = status;
      if (priority !== undefined) updateData.priority = priority;
      if (visit_date !== undefined) updateData.visit_date = visit_date;
      if (visit_time !== undefined) updateData.visit_time = visit_time;

      const updated = await Visit.update(id, updateData);

      if (updated) {
        successResponse(
          res,
          { id, ...updateData },
          "Visit updated successfully"
        );
      } else {
        errorResponse(res, "Failed to update visit");
      }
    } catch (error) {
      errorResponse(res, "Failed to update visit");
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const existingVisit = await Visit.findById(id);
      if (!existingVisit) {
        return notFoundError(res, "Visit");
      }

      if (!status) {
        return validationError(res, ["Status is required"]);
      }

      const updated = await Visit.updateStatus(id, status);

      if (updated) {
        successResponse(
          res,
          { id, status },
          "Visit status updated successfully"
        );
      } else {
        errorResponse(res, "Failed to update visit status");
      }
    } catch (error) {
      errorResponse(res, "Failed to update visit status");
    }
  },

  getTestOrders: async (req, res) => {
    try {
      const { id } = req.params;

      const existingVisit = await Visit.findById(id);
      if (!existingVisit) {
        return notFoundError(res, "Visit");
      }

      const testOrders = await Visit.getTestOrders(id);
      successResponse(res, testOrders);
    } catch (error) {
      errorResponse(res, "Failed to fetch test orders");
    }
  },
};

module.exports = visitController;
