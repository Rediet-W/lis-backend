// app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const { createDatabase, testConnection } = require("./config/database");

// Import routes
const testCategoryRoutes = require("./routes/testCategories");
const testRoutes = require("./routes/tests");
const testParameterRoutes = require("./routes/testParameters");
const parameterReferenceRangeRoutes = require("./routes/parameterReferenceRanges");
const patientRoutes = require("./routes/patients");
const visitRoutes = require("./routes/visits");
const testOrderRoutes = require("./routes/testOrders");
const testResultRoutes = require("./routes/testResults");
const parameterResultRoutes = require("./routes/parameterResults");
const dynamicQuestionRoutes = require("./routes/dynamicQuestions");
const clinicRoutes = require("./routes/clinics");
const activityLogRoutes = require("./routes/activityLogs");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const sampleTypeRoutes = require("./routes/sampleTypes");
const pathologistReportRoutes = require("./routes/pathologistReports");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/health", async (req, res) => {
  try {
    // Test database connection
    await testConnection();
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "Connected",
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// API routes
app.use("/api/test-categories", testCategoryRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/test-parameters", testParameterRoutes);
app.use("/api/reference-ranges", parameterReferenceRangeRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/test-orders", testOrderRoutes);
app.use("/api/test-results", testResultRoutes);
app.use("/api/parameter-results", parameterResultRoutes);
app.use("/api/dynamic-questions", dynamicQuestionRoutes);
app.use("/api/clinic", clinicRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/sample-types", sampleTypeRoutes);
app.use("/api/pathologist-reports", pathologistReportRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// Initialize database
const initializeApp = async () => {
  try {
    await createDatabase();
    await testConnection();
    console.log("✅ Database initialization completed");
    return app;
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    throw error;
  }
};

module.exports = app;

module.exports.initializeApp = initializeApp;
