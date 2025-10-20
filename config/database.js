// config/database.js
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
    console.error("❌ Error creating database:", error.message);
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

// Create the pool
const pool = mysql.createPool(dbConfig);

// Test the pool connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database pool connected successfully");
    connection.release();
  } catch (error) {
    console.error("❌ Database pool connection failed:", error.message);
    throw error;
  }
};

module.exports = { pool, createDatabase, testConnection };
