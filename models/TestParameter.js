const { pool } = require("../config/database");
const {
  buildInsertQuery,
  buildUpdateQuery,
  buildWhereClause,
} = require("../utils/queryUtils");

class TestParameter {
  static async findAll(filters = {}) {
    const { clause, values } = buildWhereClause(filters);
    const query = `
      SELECT tp.*, t.name as test_name, t.category_id, tc.name as category_name
      FROM test_parameters tp
      JOIN tests t ON tp.test_id = t.id
      LEFT JOIN test_categories tc ON t.category_id = tc.id
      ${clause}
      ORDER BY tp.parameter_name
    `;

    const [rows] = await pool.execute(query, values);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT tp.*, t.name as test_name, t.category_id
       FROM test_parameters tp
       JOIN tests t ON tp.test_id = t.id
       WHERE tp.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(parameterData) {
    const { query, values } = buildInsertQuery(
      "test_parameters",
      parameterData
    );
    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...parameterData };
  }

  static async update(id, parameterData) {
    const { query, values } = buildUpdateQuery(
      "test_parameters",
      parameterData,
      { id }
    );
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM test_parameters WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getByTestId(testId) {
    const [rows] = await pool.execute(
      "SELECT * FROM test_parameters WHERE test_id = ? ORDER BY parameter_name",
      [testId]
    );
    return rows;
  }

  static async getReferenceRanges(parameterId) {
    const [rows] = await pool.execute(
      "SELECT * FROM parameter_reference_ranges WHERE parameter_id = ?",
      [parameterId]
    );
    return rows;
  }
}

module.exports = TestParameter;
