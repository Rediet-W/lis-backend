const express = require("express");
const router = express.Router();
const resultController = require("../controllers/resultController");

// Test result routes
router.get("/", resultController.getAllResults);
router.get("/:id", resultController.getResultById);
router.post("/", resultController.createResult);
router.put("/:id/verify", resultController.verifyResult);
router.get("/order/:orderId", resultController.getResultByOrder);
router.get("/patient/:patientId", resultController.getResultsByPatient);

module.exports = router;
