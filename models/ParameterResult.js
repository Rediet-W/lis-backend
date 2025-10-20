const { pool } = require("../config/database");
const {
  buildInsertQuery,
  buildUpdateQuery,
  buildWhereClause,
} = require("../utils/queryUtils");

class ParameterResult {
  static async findAll(filters = {}) {
    const { clause, values } = buildWhereClause(filters);
    const query = `
      SELECT pr.*, tp.parameter_name, tp.unit as parameter_unit,
             tr.test_order_id, t.name as test_name, p.full_name as patient_name
      FROM parameter_results pr
      JOIN test_parameters tp ON pr.parameter_id = tp.id
      JOIN test_results tr ON pr.test_result_id = tr.id
      JOIN test_orders to ON tr.test_order_id = to.id
      JOIN tests t ON to.test_id = t.id
      JOIN visits v ON to.visit_id = v.id
      JOIN patients p ON v.patient_id = p.id
      ${clause}
      ORDER BY tp.parameter_name
    `;

    const [rows] = await pool.execute(query, values);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT pr.*, tp.parameter_name, tp.unit as parameter_unit,
              tr.test_order_id, t.name as test_name
       FROM parameter_results pr
       JOIN test_parameters tp ON pr.parameter_id = tp.id
       JOIN test_results tr ON pr.test_result_id = tr.id
       JOIN test_orders to ON tr.test_order_id = to.id
       JOIN tests t ON to.test_id = t.id
       WHERE pr.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(resultData) {
    const { query, values } = buildInsertQuery("parameter_results", resultData);
    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...resultData };
  }

  static async update(id, resultData) {
    const { query, values } = buildUpdateQuery(
      "parameter_results",
      resultData,
      { id }
    );
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM parameter_results WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getByTestResultId(testResultId) {
    const [rows] = await pool.execute(
      `SELECT pr.*, tp.parameter_name, tp.unit as parameter_unit
       FROM parameter_results pr
       JOIN test_parameters tp ON pr.parameter_id = tp.id
       WHERE pr.test_result_id = ?
       ORDER BY tp.parameter_name`,
      [testResultId]
    );
    return rows;
  }

  static async batchCreate(parameterResults) {
    if (parameterResults.length === 0) return [];

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const insertedResults = [];
      for (const resultData of parameterResults) {
        const { query, values } = buildInsertQuery(
          "parameter_results",
          resultData
        );
        const [result] = await connection.execute(query, values);
        insertedResults.push({ id: result.insertId, ...resultData });
      }

      await connection.commit();
      return insertedResults;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = ParameterResult;
