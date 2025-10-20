const { pool } = require("../config/database");
const {
  buildInsertQuery,
  buildUpdateQuery,
  buildWhereClause,
} = require("../utils/queryUtils");
const bcrypt = require("bcryptjs");

class User {
  static async findAll(filters = {}) {
    const { clause, values } = buildWhereClause(filters);
    const query = `SELECT id, username, email, role, full_name, phone, is_active, created_at FROM users ${clause} ORDER BY full_name`;

    const [rows] = await pool.execute(query, values);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT id, username, email, role, full_name, phone, is_active, created_at FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    return rows[0];
  }

  static async create(userData) {
    // Hash password before saving
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }

    const { query, values } = buildInsertQuery("users", userData);
    const [result] = await pool.execute(query, values);

    // Return user without password
    const { password, ...userWithoutPassword } = userData;
    return { id: result.insertId, ...userWithoutPassword };
  }

  static async update(id, userData) {
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }

    const { query, values } = buildUpdateQuery("users", userData, { id });
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async deactivate(id) {
    const [result] = await pool.execute(
      "UPDATE users SET is_active = 0 WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  static async activate(id) {
    const [result] = await pool.execute(
      "UPDATE users SET is_active = 1 WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getLaboratorists() {
    const [rows] = await pool.execute(
      "SELECT id, username, email, full_name, phone FROM users WHERE role = 'laboratorist' AND is_active = 1"
    );
    return rows;
  }
}

module.exports = User;
