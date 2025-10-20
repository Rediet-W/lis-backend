const { pool } = require("../config/database");
const {
  buildInsertQuery,
  buildUpdateQuery,
  buildWhereClause,
} = require("../utils/queryUtils");

class Test {
  static async findAll(filters = {}) {
    const { clause, values } = buildWhereClause(filters);
    const query = `
      SELECT t.*, tc.name as category_name 
      FROM tests t 
      LEFT JOIN test_categories tc ON t.category_id = tc.id 
      ${clause} 
      ORDER BY t.name
    `;

    const [rows] = await pool.execute(query, values);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT t.*, tc.name as category_name 
       FROM tests t 
       LEFT JOIN test_categories tc ON t.category_id = tc.id 
       WHERE t.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(testData) {
    const { query, values } = buildInsertQuery("tests", testData);
    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...testData };
  }

  static async update(id, testData) {
    const { query, values } = buildUpdateQuery("tests", testData, { id });
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      "UPDATE tests SET is_active = 0 WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getParameters(testId) {
    const [rows] = await pool.execute(
      "SELECT * FROM test_parameters WHERE test_id = ? ORDER BY parameter_name",
      [testId]
    );
    return rows;
  }

  static async getReferenceRanges(testId) {
    const [rows] = await pool.execute(
      `SELECT prr.*, tp.parameter_name 
       FROM parameter_reference_ranges prr 
       JOIN test_parameters tp ON prr.parameter_id = tp.id 
       WHERE tp.test_id = ?`,
      [testId]
    );
    return rows;
  }

  static async getDynamicQuestions(testId) {
    const [rows] = await pool.execute(
      "SELECT * FROM dynamic_questions WHERE test_id = ? ORDER BY id",
      [testId]
    );
    return rows;
  }
}

module.exports = Test;
