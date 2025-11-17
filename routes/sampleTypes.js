const express = require("express");
const router = express.Router();
const sampleTypeController = require("../controllers/sampleTypeController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

router.use(authenticateToken);
router.get("/", sampleTypeController.getAllSampleTypes);
router.get("/:id", sampleTypeController.getSampleTypeById);
router.post("/", sampleTypeController.createSampleType);
router.post(
  "/",
  authorizeRoles("admin"),
  sampleTypeController.createSampleType
);

// PUT /api/sample-types/:id - update (admin)
router.put(
  "/:id",
  authorizeRoles("admin"),
  sampleTypeController.updateSampleType
);

// DELETE /api/sample-types/:id - delete (admin)
router.delete(
  "/:id",
  authorizeRoles("admin"),
  sampleTypeController.deleteSampleType
);

module.exports = router;
