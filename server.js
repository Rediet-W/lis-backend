require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Route imports
const authRoutes = require("./routes/auth");
const patientRoutes = require("./routes/patients");
const testRoutes = require("./routes/tests");
const visitRoutes = require("./routes/visits");
const orderRoutes = require("./routes/orders");
const resultRoutes = require("./routes/results");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/results", resultRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "FineCare Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// API documentation route
app.get("/api", (req, res) => {
  res.json({
    message: "FineCare Medical LIS API",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/login": "User login",
        "POST /api/auth/register": "User registration",
        "GET /api/auth/me": "Get current user",
      },
      patients: {
        "GET /api/patients": "Get all patients",
        "GET /api/patients/search?q=query": "Search patients",
        "GET /api/patients/:id": "Get patient by ID",
        "POST /api/patients": "Create new patient",
        "PUT /api/patients/:id": "Update patient",
        "GET /api/patients/:id/visits": "Get patient visits",
      },
      tests: {
        "GET /api/tests": "Get all tests",
        "GET /api/tests/categories": "Get test categories",
        "GET /api/tests/:id": "Get test by ID",
        "GET /api/tests/:id/ranges": "Get test reference ranges",
        "GET /api/tests/:id/questions": "Get test dynamic questions",
      },
      visits: {
        "GET /api/visits": "Get all visits",
        "GET /api/visits/:id": "Get visit by ID",
        "POST /api/visits": "Create visit",
        "PUT /api/visits/:id": "Update visit",
        "GET /api/visits/:id/orders": "Get visit orders",
      },
      orders: {
        "GET /api/orders": "Get all orders",
        "GET /api/orders/:id": "Get order by ID",
        "POST /api/orders": "Create order",
        "PUT /api/orders/:id/status": "Update order status",
        "GET /api/orders/visit/:visitId": "Get orders by visit",
      },
      results: {
        "GET /api/results": "Get all results",
        "GET /api/results/:id": "Get result by ID",
        "POST /api/results": "Create result",
        "PUT /api/results/:id/verify": "Verify result",
        "GET /api/results/order/:orderId": "Get result by order",
        "GET /api/results/patient/:patientId": "Get results by patient",
      },
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;
