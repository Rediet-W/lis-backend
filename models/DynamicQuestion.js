const { pool } = require("../config/database");
const {
  buildInsertQuery,
  buildUpdateQuery,
  buildWhereClause,
} = require("../utils/queryUtils");

class DynamicQuestion {
  static safeParseOptions(val) {
    if (val == null || val === "") return [];
    if (Array.isArray(val)) return val;
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }

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
    return rows.map((row) => ({
      ...row,
      options: DynamicQuestion.safeParseOptions(row.options),
      is_required: !!row.is_required,
    }));
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT dq.*, t.name as test_name, t.category_id
       FROM dynamic_questions dq
       JOIN tests t ON dq.test_id = t.id
       WHERE dq.id = ?`,
      [id]
    );
    const row = rows[0];
    if (!row) return undefined;
    return {
      ...row,
      options: DynamicQuestion.safeParseOptions(row.options),
      is_required: !!row.is_required,
    };
  }

  static async create(questionData) {
    const data = { ...questionData };
    // Normalize options to array
    if (typeof data.options === "string") {
      try {
        data.options = JSON.parse(data.options);
      } catch {
        data.options = [];
      }
    }
    if (!Array.isArray(data.options)) data.options = [];
    const { query, values } = buildInsertQuery("dynamic_questions", {
      ...data,
      options: JSON.stringify(data.options),
    });
    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...data };
  }

  static async update(id, questionData) {
    const data = { ...questionData };
    if (data.options !== undefined) {
      if (typeof data.options === "string") {
        try {
          data.options = JSON.parse(data.options);
        } catch {
          data.options = [];
        }
      }
      if (!Array.isArray(data.options)) data.options = [];
      data.options = JSON.stringify(data.options);
    }
    const { query, values } = buildUpdateQuery("dynamic_questions", data, {
      id,
    });
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
    return rows.map((row) => ({
      ...row,
      options: DynamicQuestion.safeParseOptions(row.options),
      is_required: !!row.is_required,
    }));
  }
}

module.exports = DynamicQuestion;
