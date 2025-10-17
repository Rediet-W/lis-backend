const Patient = require("../models/Patient");
const Visit = require("../models/Visit");

const patientController = {
  getAllPatients: async (req, res) => {
    try {
      const patients = await Patient.getAll();
      res.json({
        success: true,
        data: patients,
        count: patients.length,
      });
    } catch (error) {
      console.error("Get patients error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch patients",
      });
    }
  },

  getPatientById: async (req, res) => {
    try {
      const patient = await Patient.getById(req.params.id);
      if (!patient) {
        return res.status(404).json({
          success: false,
          error: "Patient not found",
        });
      }

      res.json({
        success: true,
        data: patient,
      });
    } catch (error) {
      console.error("Get patient error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch patient",
      });
    }
  },

  createPatient: async (req, res) => {
    try {
      const {
        full_name,
        date_of_birth,
        gender,
        phone,
        address,
        emergency_contact,
        email,
        blood_type,
        known_allergies,
        chronic_conditions,
        current_medications,
      } = req.body;

      if (!full_name || !date_of_birth || !gender || !phone) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required fields: full_name, date_of_birth, gender, phone",
        });
      }

      const patientId = await Patient.create({
        full_name,
        date_of_birth,
        gender,
        phone,
        address,
        emergency_contact,
        email,
        blood_type,
        known_allergies,
        chronic_conditions,
        current_medications,
      });

      res.status(201).json({
        success: true,
        message: "Patient created successfully",
        data: { patient_id: patientId },
      });
    } catch (error) {
      console.error("Create patient error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create patient",
      });
    }
  },

  updatePatient: async (req, res) => {
    try {
      const patientId = req.params.id;
      const {
        full_name,
        date_of_birth,
        gender,
        phone,
        address,
        emergency_contact,
        email,
        blood_type,
        known_allergies,
        chronic_conditions,
        current_medications,
      } = req.body;

      if (!full_name || !date_of_birth || !gender || !phone) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required fields: full_name, date_of_birth, gender, phone",
        });
      }

      const updated = await Patient.update(patientId, {
        full_name,
        date_of_birth,
        gender,
        phone,
        address,
        emergency_contact,
        email,
        blood_type,
        known_allergies,
        chronic_conditions,
        current_medications,
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: "Patient not found",
        });
      }

      res.json({
        success: true,
        message: "Patient updated successfully",
      });
    } catch (error) {
      console.error("Update patient error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update patient",
      });
    }
  },

  searchPatients: async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({
          success: false,
          error: "Search query is required",
        });
      }

      const patients = await Patient.search(q);
      res.json({
        success: true,
        data: patients,
        count: patients.length,
      });
    } catch (error) {
      console.error("Search patients error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to search patients",
      });
    }
  },

  getPatientVisits: async (req, res) => {
    try {
      const visits = await Visit.getByPatient(req.params.id);
      res.json({
        success: true,
        data: visits,
        count: visits.length,
      });
    } catch (error) {
      console.error("Get patient visits error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch patient visits",
      });
    }
  },
};

module.exports = patientController;
