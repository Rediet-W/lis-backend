const { pool } = require("../config/database");
const { buildInsertQuery, buildWhereClause } = require("../utils/queryUtils");

class ActivityLog {
  static async findAll(filters = {}) {
    const { clause, values } = buildWhereClause(filters);
    const query = `
      SELECT al.*, u.full_name as user_name, u.role as user_role
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${clause}
      ORDER BY al.created_at DESC
    `;

    const [rows] = await pool.execute(query, values);
    return rows;
  }

  static async create(logData) {
    const { query, values } = buildInsertQuery("activity_logs", logData);
    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...logData };
  }

  static async logActivity(userId, action, description) {
    const logData = {
      user_id: userId,
      action,
      description,
    };

    return await this.create(logData);
  }

  static async getUserActivities(userId, limit = 50) {
    const [rows] = await pool.execute(
      `SELECT al.*, u.full_name as user_name 
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.user_id = ?
       ORDER BY al.created_at DESC
       LIMIT ?`,
      [userId, limit]
    );
    return rows;
  }

  static async getRecentActivities(limit = 100) {
    const [rows] = await pool.execute(
      `SELECT al.*, u.full_name as user_name, u.role as user_role
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }
}

module.exports = ActivityLog;
