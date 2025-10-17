require("dotenv").config();
const { initDatabase } = require("./models/db");
const pool = require("./config/database");

const startServer = async () => {
  try {
    console.log("🚀 Starting FineCare Backend...");

    // Test database connection
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();

    // Initialize database structure
    await initDatabase();

    // Import and start the Express server
    const app = require("./server");
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`🏥 FineCare Backend running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🕐 Started at: ${new Date().toLocaleString()}`);
    });
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1);
  }
};

startServer();
