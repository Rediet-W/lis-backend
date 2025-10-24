const { pool } = require("../config/database");
const {
  buildInsertQuery,
  buildUpdateQuery,
  buildWhereClause,
} = require("../utils/queryUtils");

class TestResult {
  static async findAll(filters = {}) {
    const { clause, values } = buildWhereClause(filters);
    const query = `
      SELECT tr.*, o.id AS test_order_id, t.name as test_name, p.full_name as patient_name,
             u.full_name as laboratorist_name, verifier.full_name as verified_by_name
      FROM test_results tr
      JOIN test_orders o ON tr.test_order_id = o.id
      JOIN tests t ON o.test_id = t.id
      JOIN visits v ON o.visit_id = v.id
      JOIN patients p ON v.patient_id = p.id
      LEFT JOIN users u ON tr.laboratorist_id = u.id
      LEFT JOIN users verifier ON tr.verified_by = verifier.id
      ${clause}
      ORDER BY tr.created_at DESC
    `;

    const [rows] = await pool.execute(query, values);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT tr.*, o.test_id, o.visit_id, t.name as test_name,
              p.full_name as patient_name, p.card_number, p.date_of_birth, p.gender,
              u.full_name as laboratorist_name, verifier.full_name as verified_by_name
       FROM test_results tr
       JOIN test_orders o ON tr.test_order_id = o.id
       JOIN tests t ON o.test_id = t.id
       JOIN visits v ON o.visit_id = v.id
       JOIN patients p ON v.patient_id = p.id
       LEFT JOIN users u ON tr.laboratorist_id = u.id
       LEFT JOIN users verifier ON tr.verified_by = verifier.id
       WHERE tr.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(resultData) {
    const { query, values } = buildInsertQuery("test_results", resultData);
    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...resultData };
  }

  static async update(id, resultData) {
    const { query, values } = buildUpdateQuery("test_results", resultData, {
      id,
    });
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async verifyResult(id, verifiedBy) {
    const [result] = await pool.execute(
      "UPDATE test_results SET is_verified = 1, verified_by = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?",
      [verifiedBy, id]
    );
    return result.affectedRows > 0;
  }

  static async getParameterResults(testResultId) {
    const [rows] = await pool.execute(
      `SELECT pr.*, tp.parameter_name, tp.unit as parameter_unit
       FROM parameter_results pr
       JOIN test_parameters tp ON pr.parameter_id = tp.id
       WHERE pr.test_result_id = ?`,
      [testResultId]
    );
    return rows;
  }

  static async findByTestOrderId(testOrderId) {
    const [rows] = await pool.execute(
      "SELECT * FROM test_results WHERE test_order_id = ?",
      [testOrderId]
    );
    return rows[0];
  }
}

module.exports = TestResult;
