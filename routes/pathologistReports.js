const express = require("express");
const router = express.Router();
const pathologistReportController = require("../controllers/pathologistReportController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

router.use(authenticateToken);

// GET /api/pathologist-reports
router.get("/", pathologistReportController.getAll);

// GET /api/pathologist-reports/:id
router.get("/:id", pathologistReportController.getById);

// POST /api/pathologist-reports (pathologist or admin)
router.post(
  "/",
  authorizeRoles("pathologist", "admin"),
  pathologistReportController.create
);

// PUT /api/pathologist-reports/:id (pathologist or admin)
router.put(
  "/:id",
  authorizeRoles("pathologist", "admin"),
  pathologistReportController.update
);

// DELETE /api/pathologist-reports/:id (admin)
router.delete(
  "/:id",
  authorizeRoles("admin"),
  pathologistReportController.delete
);

module.exports = router;
