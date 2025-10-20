const { pool } = require("../config/database");
const {
  buildInsertQuery,
  buildUpdateQuery,
  buildWhereClause,
} = require("../utils/queryUtils");

class TestCategory {
  static async findAll(filters = {}) {
    const { clause, values } = buildWhereClause(filters);
    const query = `SELECT * FROM test_categories ${clause} ORDER BY name`;

    const [rows] = await pool.execute(query, values);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM test_categories WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async create(categoryData) {
    const { query, values } = buildInsertQuery("test_categories", categoryData);
    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...categoryData };
  }

  static async update(id, categoryData) {
    const { query, values } = buildUpdateQuery(
      "test_categories",
      categoryData,
      { id }
    );
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM test_categories WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getTests(categoryId) {
    const [rows] = await pool.execute(
      `SELECT t.*, tc.name as category_name 
       FROM tests t 
       JOIN test_categories tc ON t.category_id = tc.id 
       WHERE t.category_id = ? AND t.is_active = 1 
       ORDER BY t.name`,
      [categoryId]
    );
    return rows;
  }
}

module.exports = TestCategory;
