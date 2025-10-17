const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Test order routes
router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.post("/", orderController.createOrder);
router.put("/:id/status", orderController.updateOrderStatus);
router.get("/visit/:visitId", orderController.getOrdersByVisit);

module.exports = router;
