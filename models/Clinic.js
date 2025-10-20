const { pool } = require("../config/database");
const { buildInsertQuery, buildUpdateQuery } = require("../utils/queryUtils");

class Clinic {
  static async find() {
    const [rows] = await pool.execute("SELECT * FROM clinics LIMIT 1");
    return rows[0];
  }

  static async create(clinicData) {
    const { query, values } = buildInsertQuery("clinics", {
      ...clinicData,
      test_list: clinicData.test_list
        ? JSON.stringify(clinicData.test_list)
        : null,
    });

    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...clinicData };
  }

  static async update(id, clinicData) {
    if (clinicData.test_list) {
      clinicData.test_list = JSON.stringify(clinicData.test_list);
    }

    const { query, values } = buildUpdateQuery("clinics", clinicData, { id });
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async updateSettings(settingsData) {
    const existing = await this.find();

    if (existing) {
      return await this.update(existing.id, settingsData);
    } else {
      return await this.create(settingsData);
    }
  }

  static async getTestList() {
    const clinic = await this.find();
    if (clinic && clinic.test_list) {
      return {
        ...clinic,
        test_list: JSON.parse(clinic.test_list),
      };
    }
    return clinic;
  }
}

module.exports = Clinic;
