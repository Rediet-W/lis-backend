const Visit = require("../models/Visit");

const visitController = {
  getAllVisits: async (req, res) => {
    try {
      const visits = await Visit.getAll();
      res.json({
        success: true,
        data: visits,
        count: visits.length,
      });
    } catch (error) {
      console.error("Get visits error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch visits",
      });
    }
  },

  getVisitById: async (req, res) => {
    try {
      const visit = await Visit.getById(req.params.id);
      if (!visit) {
        return res.status(404).json({
          success: false,
          error: "Visit not found",
        });
      }

      res.json({
        success: true,
        data: visit,
      });
    } catch (error) {
      console.error("Get visit error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch visit",
      });
    }
  },

  createVisit: async (req, res) => {
    try {
      const {
        patient_id,
        receptionist_id,
        visit_date,
        visit_time,
        priority,
        special_instructions,
      } = req.body;

      if (!patient_id || !receptionist_id || !visit_date || !visit_time) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required fields: patient_id, receptionist_id, visit_date, visit_time",
        });
      }

      const visitId = await Visit.create({
        patient_id,
        receptionist_id,
        visit_date,
        visit_time,
        priority: priority || "routine",
        special_instructions,
      });

      res.status(201).json({
        success: true,
        message: "Visit created successfully",
        data: { visit_id: visitId },
      });
    } catch (error) {
      console.error("Create visit error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create visit",
      });
    }
  },

  updateVisit: async (req, res) => {
    try {
      const visitId = req.params.id;
      const { status, priority, special_instructions } = req.body;

      const updated = await Visit.update(visitId, {
        status,
        priority,
        special_instructions,
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: "Visit not found",
        });
      }

      res.json({
        success: true,
        message: "Visit updated successfully",
      });
    } catch (error) {
      console.error("Update visit error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update visit",
      });
    }
  },

  getVisitOrders: async (req, res) => {
    try {
      const orders = await Visit.getOrders(req.params.id);
      res.json({
        success: true,
        data: orders,
        count: orders.length,
      });
    } catch (error) {
      console.error("Get visit orders error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch visit orders",
      });
    }
  },
};

module.exports = visitController;
