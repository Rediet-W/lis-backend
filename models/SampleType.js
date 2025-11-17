const { pool } = require("../config/database");
const {
  buildInsertQuery,
  buildUpdateQuery,
  buildWhereClause,
} = require("../utils/queryUtils");

class SampleType {
  static async findAll(filters = {}) {
    if (typeof filters === "boolean") {
      filters = { is_active: filters ? 1 : undefined };
    }
    const { clause, values } = buildWhereClause(filters);
    const query = `SELECT * FROM sample_types ${clause} ORDER BY name`;
    const [rows] = await pool.execute(query, values);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM sample_types WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async create(sampleTypeData) {
    const { query, values } = buildInsertQuery("sample_types", sampleTypeData);
    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...sampleTypeData };
  }

  static async update(id, sampleTypeData) {
    const { query, values } = buildUpdateQuery("sample_types", sampleTypeData, {
      id,
    });
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM sample_types WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getTests(sampleTypeId) {
    const [rows] = await pool.execute(
      `SELECT t.*, st.name AS sample_type_name
       FROM tests t
       JOIN sample_types st ON t.sample_type_id = st.id
       WHERE t.sample_type_id = ? AND t.is_active = 1
       ORDER BY t.name`,
      [sampleTypeId]
    );
    return rows;
  }
}

module.exports = SampleType;
