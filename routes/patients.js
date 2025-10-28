const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Apply authentication to all routes
router.use(authenticateToken);

// Self profile (current logged-in user's patient record)
router.get("/me", patientController.me);
router.put("/me", patientController.updateMe);

// GET /api/patients - Get all patients
router.get("/", patientController.getAll);

// GET /api/patients/search - Search patients
router.get("/search", patientController.search);

// GET /api/patients/:id - Get patient by ID
router.get("/:id", patientController.getById);

// POST /api/patients - Create new patient
router.post(
  "/",
  authorizeRoles("admin", "receptionist"),
  patientController.create
);

// PUT /api/patients/:id - Update patient
router.put(
  "/:id",
  authorizeRoles("admin", "receptionist"),
  patientController.update
);

module.exports = router;
