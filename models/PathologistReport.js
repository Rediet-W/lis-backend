const { pool } = require("../config/database");
const {
  buildInsertQuery,
  buildUpdateQuery,
  buildWhereClause,
} = require("../utils/queryUtils");

class PathologistReport {
  static async findAll(filters = {}) {
    const { clause, values } = buildWhereClause(filters);
    const query = `
      SELECT pr.*,
             u.full_name as pathologist_name,
             to_table.test_id as test_id,
             t.name as test_name,
             v.patient_id,
             p.full_name as patient_name
      FROM pathologist_reports pr
      JOIN test_orders to_table ON pr.test_order_id = to_table.id
      LEFT JOIN tests t ON to_table.test_id = t.id
      LEFT JOIN users u ON pr.pathologist_id = u.id
      LEFT JOIN visits v ON to_table.visit_id = v.id
      LEFT JOIN patients p ON v.patient_id = p.id
      ${clause}
      ORDER BY pr.created_at DESC
    `;
    const [rows] = await pool.execute(query, values);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT pr.*,
              u.full_name as pathologist_name,
              to_table.test_id as test_id,
              t.name as test_name,
              v.patient_id,
              p.full_name as patient_name
       FROM pathologist_reports pr
       JOIN test_orders to_table ON pr.test_order_id = to_table.id
       LEFT JOIN tests t ON to_table.test_id = t.id
       LEFT JOIN users u ON pr.pathologist_id = u.id
       LEFT JOIN visits v ON to_table.visit_id = v.id
       LEFT JOIN patients p ON v.patient_id = p.id
       WHERE pr.id = ? LIMIT 1`,
      [id]
    );
    return rows[0];
  }

  static async create(reportData) {
    const { query, values } = buildInsertQuery(
      "pathologist_reports",
      reportData
    );
    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...reportData };
  }

  static async update(id, reportData) {
    const { query, values } = buildUpdateQuery(
      "pathologist_reports",
      reportData,
      { id }
    );
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM pathologist_reports WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = PathologistReport;
