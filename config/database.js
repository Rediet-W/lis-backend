const mysql = require("mysql2/promise");
require("dotenv").config();

const createDatabase = async () => {
  const tempConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  };

  try {
    const connection = await mysql.createConnection(tempConfig);
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "medical_lis"}`
    );
    console.log("✅ Database created/verified successfully");
    await connection.end();
  } catch (error) {
    console.error("❌ Error creating database:", error);
    throw error;
  }
};

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "lis",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create the pool directly
const pool = mysql.createPool(dbConfig);

module.exports = pool;
