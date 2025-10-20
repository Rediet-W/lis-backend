const { pool } = require("../config/database");
const {
  buildInsertQuery,
  buildUpdateQuery,
  buildWhereClause,
} = require("../utils/queryUtils");

class DynamicQuestion {
  static async findAll(filters = {}) {
    const { clause, values } = buildWhereClause(filters);
    const query = `
      SELECT dq.*, t.name as test_name, t.category_id
      FROM dynamic_questions dq
      JOIN tests t ON dq.test_id = t.id
      ${clause}
      ORDER BY dq.id
    `;

    const [rows] = await pool.execute(query, values);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT dq.*, t.name as test_name, t.category_id
       FROM dynamic_questions dq
       JOIN tests t ON dq.test_id = t.id
       WHERE dq.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(questionData) {
    // Parse options if it's a string
    if (typeof questionData.options === "string") {
      questionData.options = JSON.parse(questionData.options);
    }

    const { query, values } = buildInsertQuery("dynamic_questions", {
      ...questionData,
      options: JSON.stringify(questionData.options),
    });

    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...questionData };
  }

  static async update(id, questionData) {
    // Parse options if it's a string
    if (questionData.options && typeof questionData.options === "string") {
      questionData.options = JSON.parse(questionData.options);
    }

    if (questionData.options) {
      questionData.options = JSON.stringify(questionData.options);
    }

    const { query, values } = buildUpdateQuery(
      "dynamic_questions",
      questionData,
      { id }
    );
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM dynamic_questions WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getByTestId(testId) {
    const [rows] = await pool.execute(
      "SELECT * FROM dynamic_questions WHERE test_id = ? ORDER BY id",
      [testId]
    );

    // Parse options JSON
    return rows.map((row) => ({
      ...row,
      options: row.options ? JSON.parse(row.options) : null,
    }));
  }
}

module.exports = DynamicQuestion;
