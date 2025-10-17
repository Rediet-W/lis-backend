const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");

// Patient routes
router.get("/", patientController.getAllPatients);
router.get("/search", patientController.searchPatients);
router.get("/:id", patientController.getPatientById);
router.post("/", patientController.createPatient);
router.put("/:id", patientController.updatePatient);
router.get("/:id/visits", patientController.getPatientVisits);

module.exports = router;
