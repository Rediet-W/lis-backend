const pool = require("../config/database");

class Test {
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT t.*, tc.name as category_name 
      FROM tests t 
      JOIN test_categories tc ON t.category_id = tc.id 
      WHERE t.is_active = TRUE 
      ORDER BY tc.name, t.name
    `);
    return rows;
  }

  static async getById(testId) {
    const [rows] = await pool.execute(
      `SELECT t.*, tc.name as category_name 
       FROM tests t 
       JOIN test_categories tc ON t.category_id = tc.id 
       WHERE t.id = ?`,
      [testId]
    );
    return rows[0];
  }

  static async getReferenceRanges(testId) {
    const [rows] = await pool.execute(
      `SELECT * FROM test_reference_ranges 
       WHERE test_id = ? 
       ORDER BY gender, min_age`,
      [testId]
    );
    return rows;
  }

  static async getDynamicQuestions(testId) {
    const [rows] = await pool.execute(
      `SELECT * FROM dynamic_questions 
       WHERE test_id = ? 
       ORDER BY is_required DESC, id`,
      [testId]
    );
    return rows;
  }

  static async getTestParameters(testId) {
    const [rows] = await pool.execute(
      `SELECT * FROM test_parameters 
       WHERE test_id = ? 
       ORDER BY id`,
      [testId]
    );
    return rows;
  }
}

module.exports = Test;
