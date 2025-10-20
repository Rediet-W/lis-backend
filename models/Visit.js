const { pool } = require("../config/database");
const {
  buildInsertQuery,
  buildUpdateQuery,
  buildWhereClause,
} = require("../utils/queryUtils");

class Visit {
  static async findAll(filters = {}) {
    const { clause, values } = buildWhereClause(filters);
    const query = `
      SELECT v.*, p.full_name as patient_name, p.card_number, u.full_name as receptionist_name
      FROM visits v
      JOIN patients p ON v.patient_id = p.id
      LEFT JOIN users u ON v.receptionist_id = u.id
      ${clause}
      ORDER BY v.visit_date DESC, v.visit_time DESC
    `;

    const [rows] = await pool.execute(query, values);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT v.*, p.full_name as patient_name, p.card_number, p.date_of_birth, p.gender,
              u.full_name as receptionist_name
       FROM visits v
       JOIN patients p ON v.patient_id = p.id
       LEFT JOIN users u ON v.receptionist_id = u.id
       WHERE v.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(visitData) {
    const { query, values } = buildInsertQuery("visits", visitData);
    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...visitData };
  }

  static async update(id, visitData) {
    const { query, values } = buildUpdateQuery("visits", visitData, { id });
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async getTestOrders(visitId) {
    const [rows] = await pool.execute(
      `SELECT to.*, t.name as test_name, t.sample_type, tc.name as category_name,
              u.full_name as ordered_by_name
       FROM test_orders to
       JOIN tests t ON to.test_id = t.id
       LEFT JOIN test_categories tc ON t.category_id = tc.id
       LEFT JOIN users u ON to.ordered_by = u.id
       WHERE to.visit_id = ?
       ORDER BY to.ordered_at DESC`,
      [visitId]
    );
    return rows;
  }

  static async updateStatus(id, status) {
    const [result] = await pool.execute(
      "UPDATE visits SET status = ? WHERE id = ?",
      [status, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Visit;
