const SampleType = require("../models/SampleType");

const sampleTypeController = {
  // Get all sample types
  getAllSampleTypes: async (req, res) => {
    try {
      const activeOnly = req.query.active !== "false";
      const sampleTypes = await SampleType.findAll(activeOnly);
      res.json(sampleTypes);
    } catch (error) {
      console.error("Error fetching sample types:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get sample type by ID
  getSampleTypeById: async (req, res) => {
    try {
      const sampleType = await SampleType.findById(req.params.id);
      if (!sampleType) {
        return res.status(404).json({ error: "Sample type not found" });
      }
      res.json(sampleType);
    } catch (error) {
      console.error("Error fetching sample type:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Create new sample type
  createSampleType: async (req, res) => {
    try {
      const { name, description, is_active } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Sample type name is required" });
      }

      const sampleTypeId = await SampleType.create({
        name,
        description,
        is_active,
      });

      res.status(201).json({
        message: "Sample type created successfully",
        id: sampleTypeId,
      });
    } catch (error) {
      console.error("Error creating sample type:", error);
      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ error: "Sample type name already exists" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  },
  updateSampleType: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, is_active } = req.body;

      const existing = await SampleType.findById(id);
      if (!existing)
        return res.status(404).json({ error: "Sample type not found" });

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (is_active !== undefined) updateData.is_active = is_active ? 1 : 0;

      const success = await SampleType.update(id, updateData);
      if (success) {
        return res.json({
          message: "Sample type updated successfully",
          data: { id: Number(id), ...updateData },
        });
      } else {
        return res.status(400).json({ error: "Failed to update sample type" });
      }
    } catch (error) {
      console.error("Error updating sample type:", error);
      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ error: "Sample type name already exists" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Delete sample type
  deleteSampleType: async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await SampleType.findById(id);
      if (!existing)
        return res.status(404).json({ error: "Sample type not found" });

      const deleted = await SampleType.delete(id);
      if (deleted) {
        return res.json({ message: "Sample type deleted successfully" });
      } else {
        return res.status(400).json({ error: "Failed to delete sample type" });
      }
    } catch (error) {
      console.error("Error deleting sample type:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = sampleTypeController;
