const { pool } = require("../config/database");
const {
  buildInsertQuery,
  buildUpdateQuery,
  buildWhereClause,
} = require("../utils/queryUtils");

class Patient {
  static async findAll(filters = {}) {
    const { clause, values } = buildWhereClause(filters);
    const query = `SELECT * FROM patients ${clause} ORDER BY full_name`;

    const [rows] = await pool.execute(query, values);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM patients WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  static async findByCardNumber(cardNumber) {
    const [rows] = await pool.execute(
      "SELECT * FROM patients WHERE card_number = ?",
      [cardNumber]
    );
    return rows[0];
  }

  static async create(patientData) {
    const { query, values } = buildInsertQuery("patients", patientData);
    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...patientData };
  }

  static async update(id, patientData) {
    const { query, values } = buildUpdateQuery("patients", patientData, { id });
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async getVisits(patientId) {
    const [rows] = await pool.execute(
      `SELECT v.*, u.full_name as receptionist_name 
       FROM visits v 
       LEFT JOIN users u ON v.receptionist_id = u.id 
       WHERE v.patient_id = ? 
       ORDER BY v.visit_date DESC, v.visit_time DESC`,
      [patientId]
    );
    return rows;
  }

  static async search(query) {
    const searchQuery = `
      SELECT * FROM patients 
      WHERE full_name LIKE ? OR card_number LIKE ? OR phone LIKE ? OR email LIKE ?
      ORDER BY full_name
    `;
    const searchValue = `%${query}%`;
    const [rows] = await pool.execute(searchQuery, [
      searchValue,
      searchValue,
      searchValue,
      searchValue,
    ]);
    return rows;
  }
}

module.exports = Patient;
