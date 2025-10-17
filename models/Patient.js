const pool = require("../config/database");

class Patient {
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT *, 
             TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) as age 
      FROM patients 
      ORDER BY created_at DESC
    `);
    return rows;
  }

  static async getById(patientId) {
    const [rows] = await pool.execute(
      `SELECT *, 
              TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) as age 
       FROM patients 
       WHERE id = ?`,
      [patientId]
    );
    return rows[0];
  }

  static async create(patientData) {
    // Generate card number (you might want a better system for this)
    const cardNumber = "FC" + Date.now().toString().slice(-6);

    const [result] = await pool.execute(
      `INSERT INTO patients 
       (card_number, full_name, date_of_birth, gender, phone, address, emergency_contact, email, blood_type, known_allergies, chronic_conditions, current_medications) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cardNumber,
        patientData.full_name,
        patientData.date_of_birth,
        patientData.gender,
        patientData.phone,
        patientData.address,
        patientData.emergency_contact,
        patientData.email,
        patientData.blood_type || "unknown",
        patientData.known_allergies,
        patientData.chronic_conditions,
        patientData.current_medications,
      ]
    );
    return result.insertId;
  }

  static async update(patientId, patientData) {
    const [result] = await pool.execute(
      `UPDATE patients 
       SET full_name = ?, date_of_birth = ?, gender = ?, phone = ?, address = ?,
           emergency_contact = ?, email = ?, blood_type = ?, known_allergies = ?,
           chronic_conditions = ?, current_medications = ?
       WHERE id = ?`,
      [
        patientData.full_name,
        patientData.date_of_birth,
        patientData.gender,
        patientData.phone,
        patientData.address,
        patientData.emergency_contact,
        patientData.email,
        patientData.blood_type,
        patientData.known_allergies,
        patientData.chronic_conditions,
        patientData.current_medications,
        patientId,
      ]
    );
    return result.affectedRows > 0;
  }

  static async calculateAge(dateOfBirth) {
    const [rows] = await pool.execute(
      "SELECT TIMESTAMPDIFF(YEAR, ?, CURDATE()) as age",
      [dateOfBirth]
    );
    return rows[0].age;
  }

  static async search(query) {
    const [rows] = await pool.execute(
      `SELECT *, TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) as age 
       FROM patients 
       WHERE full_name LIKE ? OR card_number LIKE ? OR phone LIKE ?
       ORDER BY full_name`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    return rows;
  }
}

module.exports = Patient;
