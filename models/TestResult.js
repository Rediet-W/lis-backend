const pool = require("../config/database");

class TestResult {
  static async create(resultData) {
    const [result] = await pool.execute(
      `INSERT INTO test_results 
       (patient_id, test_id, result_value, status, interpretation, notes, performed_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        resultData.patient_id,
        resultData.test_id,
        resultData.result_value,
        resultData.status,
        resultData.interpretation,
        resultData.notes,
        resultData.performed_by,
      ]
    );
    return result.insertId;
  }

  static async getByPatient(patientId) {
    const [rows] = await pool.execute(
      `SELECT tr.*, t.test_name, t.test_unit, t.test_code,
              p.first_name, p.last_name, p.gender, p.date_of_birth,
              TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age,
              p.is_pregnant
       FROM test_results tr
       JOIN tests t ON tr.test_id = t.test_id
       JOIN patients p ON tr.patient_id = p.patient_id
       WHERE tr.patient_id = ?
       ORDER BY tr.result_date DESC`,
      [patientId]
    );
    return rows;
  }

  static async getAll() {
    const [rows] = await pool.execute(
      `SELECT tr.*, t.test_name, t.test_unit, t.test_code,
              p.first_name, p.last_name, p.gender, p.date_of_birth,
              TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age,
              p.is_pregnant
       FROM test_results tr
       JOIN tests t ON tr.test_id = t.test_id
       JOIN patients p ON tr.patient_id = p.patient_id
       ORDER BY tr.result_date DESC
       LIMIT 100`
    );
    return rows;
  }

  static async interpretResult(
    testId,
    resultValue,
    patientGender,
    patientAge,
    isPregnant
  ) {
    const Test = require("./Test");
    const referenceRange = await Test.getApplicableRange(
      testId,
      patientGender,
      patientAge,
      isPregnant
    );

    if (!referenceRange) {
      return {
        status: "Completed",
        interpretation: "No reference range available",
        normal_min: null,
        normal_max: null,
      };
    }

    let status = "Completed";
    let interpretation = "Normal";

    if (resultValue < referenceRange.normal_min) {
      status = "Abnormal";
      interpretation = "LOW";
    } else if (resultValue > referenceRange.normal_max) {
      status = "Abnormal";
      interpretation = "HIGH";
    }

    return {
      status,
      interpretation,
      normal_min: referenceRange.normal_min,
      normal_max: referenceRange.normal_max,
      reference_notes: referenceRange.notes,
    };
  }
}

module.exports = TestResult;
