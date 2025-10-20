const { pool } = require("../config/database");
const {
  buildInsertQuery,
  buildUpdateQuery,
  buildWhereClause,
} = require("../utils/queryUtils");

class ParameterReferenceRange {
  static async findAll(filters = {}) {
    const { clause, values } = buildWhereClause(filters);
    const query = `
      SELECT prr.*, tp.parameter_name, tp.unit as parameter_unit, t.name as test_name
      FROM parameter_reference_ranges prr
      JOIN test_parameters tp ON prr.parameter_id = tp.id
      JOIN tests t ON tp.test_id = t.id
      ${clause}
      ORDER BY tp.parameter_name, prr.gender, prr.min_age
    `;

    const [rows] = await pool.execute(query, values);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT prr.*, tp.parameter_name, tp.unit as parameter_unit, t.name as test_name, t.id as test_id
       FROM parameter_reference_ranges prr
       JOIN test_parameters tp ON prr.parameter_id = tp.id
       JOIN tests t ON tp.test_id = t.id
       WHERE prr.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(rangeData) {
    const { query, values } = buildInsertQuery(
      "parameter_reference_ranges",
      rangeData
    );
    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...rangeData };
  }

  static async update(id, rangeData) {
    const { query, values } = buildUpdateQuery(
      "parameter_reference_ranges",
      rangeData,
      { id }
    );
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM parameter_reference_ranges WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  static async findByParameter(parameterId, gender = "both", age = null) {
    let query = `
      SELECT * FROM parameter_reference_ranges 
      WHERE parameter_id = ? AND gender IN (?, 'both')
    `;
    const values = [parameterId, gender];

    if (age !== null) {
      query += ` AND (min_age IS NULL OR min_age <= ?) AND (max_age IS NULL OR max_age >= ?)`;
      values.push(age, age);
    }

    query += ` ORDER BY gender DESC, min_age DESC LIMIT 1`;

    const [rows] = await pool.execute(query, values);
    return rows[0];
  }
}

module.exports = ParameterReferenceRange;
