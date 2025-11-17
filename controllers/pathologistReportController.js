const PathologistReport = require("../models/PathologistReport");
const {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
} = require("../utils/responseUtils");
const { validateRequiredFields } = require("../utils/validationUtils");

const pathologistReportController = {
  // GET /api/pathologist-reports
  getAll: async (req, res) => {
    try {
      const filters = {};
      if (req.query.test_order_id)
        filters.test_order_id = req.query.test_order_id;
      if (req.query.pathologist_id)
        filters.pathologist_id = req.query.pathologist_id;
      if (req.query.status) filters.status = req.query.status;
      const reports = await PathologistReport.findAll(filters);
      return successResponse(res, reports);
    } catch (error) {
      return errorResponse(res, "Failed to fetch pathologist reports");
    }
  },

  // GET /api/pathologist-reports/:id
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const report = await PathologistReport.findById(id);
      if (!report) return notFoundError(res, "Pathologist Report");
      return successResponse(res, report);
    } catch (error) {
      return errorResponse(res, "Failed to fetch pathologist report");
    }
  },

  // POST /api/pathologist-reports
  create: async (req, res) => {
    try {
      const { test_order_id, pathologist_id, report_data } = req.body;
      const errors = validateRequiredFields(
        { test_order_id, pathologist_id, report_data },
        ["test_order_id", "pathologist_id", "report_data"]
      );
      if (errors.length) return validationError(res, errors);

      // normalize JSON fields
      const payload = {
        test_order_id,
        pathologist_id,
        report_data: JSON.stringify(report_data),
        images: req.body.images ? JSON.stringify(req.body.images) : null,
        overall_comments: req.body.overall_comments || null,
        status: req.body.status || "draft",
        is_verified: req.body.is_verified ? 1 : 0,
        verified_by: req.body.verified_by || null,
        verified_at: req.body.verified_at || null,
      };

      const created = await PathologistReport.create(payload);
      return successResponse(res, created, "Pathologist report created", 201);
    } catch (error) {
      return errorResponse(res, "Failed to create pathologist report");
    }
  },

  // PUT /api/pathologist-reports/:id
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await PathologistReport.findById(id);
      if (!existing) return notFoundError(res, "Pathologist Report");

      const payload = {};
      if (req.body.report_data !== undefined)
        payload.report_data = JSON.stringify(req.body.report_data);
      if (req.body.images !== undefined)
        payload.images = JSON.stringify(req.body.images);
      if (req.body.overall_comments !== undefined)
        payload.overall_comments = req.body.overall_comments;
      if (req.body.status !== undefined) payload.status = req.body.status;
      if (req.body.is_verified !== undefined)
        payload.is_verified = req.body.is_verified ? 1 : 0;
      if (req.body.verified_by !== undefined)
        payload.verified_by = req.body.verified_by;
      if (req.body.verified_at !== undefined)
        payload.verified_at = req.body.verified_at;

      const updated = await PathologistReport.update(id, payload);
      if (!updated)
        return errorResponse(res, "Failed to update pathologist report");
      const fresh = await PathologistReport.findById(id);
      return successResponse(res, fresh, "Pathologist report updated");
    } catch (error) {
      return errorResponse(res, "Failed to update pathologist report");
    }
  },

  // DELETE /api/pathologist-reports/:id
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await PathologistReport.findById(id);
      if (!existing) return notFoundError(res, "Pathologist Report");
      const ok = await PathologistReport.delete(id);
      if (!ok) return errorResponse(res, "Failed to delete pathologist report");
      return successResponse(res, null, "Pathologist report deleted");
    } catch (error) {
      return errorResponse(res, "Failed to delete pathologist report");
    }
  },
};

module.exports = pathologistReportController;
