const express = require("express");
const router = express.Router();
const visitController = require("../controllers/visitController");

// Visit routes
router.get("/", visitController.getAllVisits);
router.get("/:id", visitController.getVisitById);
router.post("/", visitController.createVisit);
router.put("/:id", visitController.updateVisit);
router.get("/:id/orders", visitController.getVisitOrders);

module.exports = router;
