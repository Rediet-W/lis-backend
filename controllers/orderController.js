const TestOrder = require("../models/TestOrder");

const orderController = {
  getAllOrders: async (req, res) => {
    try {
      const orders = await TestOrder.getAll();
      res.json({
        success: true,
        data: orders,
        count: orders.length,
      });
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch orders",
      });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const order = await TestOrder.getById(req.params.id);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Order not found",
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch order",
      });
    }
  },

  createOrder: async (req, res) => {
    try {
      const { visit_id, test_id, priority, dynamic_answers, ordered_by } =
        req.body;

      if (!visit_id || !test_id || !ordered_by) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: visit_id, test_id, ordered_by",
        });
      }

      const orderId = await TestOrder.create({
        visit_id,
        test_id,
        priority: priority || "normal",
        dynamic_answers: dynamic_answers || {},
        ordered_by,
      });

      res.status(201).json({
        success: true,
        message: "Test order created successfully",
        data: { order_id: orderId },
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create order",
      });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const orderId = req.params.id;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: "Status is required",
        });
      }

      const updated = await TestOrder.updateStatus(orderId, status);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: "Order not found",
        });
      }

      res.json({
        success: true,
        message: "Order status updated successfully",
      });
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update order status",
      });
    }
  },

  getOrdersByVisit: async (req, res) => {
    try {
      const orders = await TestOrder.getByVisit(req.params.visitId);
      res.json({
        success: true,
        data: orders,
        count: orders.length,
      });
    } catch (error) {
      console.error("Get orders by visit error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch orders",
      });
    }
  },
};

module.exports = orderController;
