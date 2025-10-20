// start.js
const { createDatabase, pool } = require("./config/database");
const app = require("./app");

const startServer = async () => {
  try {
    console.log("🚀 Starting FineCare Backend...");

    // Test database connection
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🚀 API ready at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start application:", error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

startServer();
