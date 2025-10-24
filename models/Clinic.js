const { pool } = require("../config/database");
const { buildInsertQuery, buildUpdateQuery } = require("../utils/queryUtils");

class Clinic {
  static async find() {
    try {
      const [rows] = await pool.execute("SELECT * FROM clinics LIMIT 1");
      return rows[0];
    } catch (error) {
      console.error("Database error in Clinic.find:", error);
      throw error;
    }
  }

  static async create(clinicData) {
    try {
      const { query, values } = buildInsertQuery("clinics", {
        ...clinicData,
        test_list: clinicData.test_list
          ? JSON.stringify(clinicData.test_list)
          : null,
      });

      const [result] = await pool.execute(query, values);
      return { id: result.insertId, ...clinicData };
    } catch (error) {
      console.error("Database error in Clinic.create:", error);
      throw error;
    }
  }

  static async update(id, clinicData) {
    try {
      if (clinicData.test_list) {
        clinicData.test_list = JSON.stringify(clinicData.test_list);
      }

      const { query, values } = buildUpdateQuery("clinics", clinicData, { id });
      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Database error in Clinic.update:", error);
      throw error;
    }
  }

  static async updateSettings(settingsData) {
    try {
      const existing = await this.find();

      if (existing) {
        return await this.update(existing.id, settingsData);
      } else {
        return await this.create(settingsData);
      }
    } catch (error) {
      console.error("Database error in Clinic.updateSettings:", error);
      throw error;
    }
  }

  static async getTestList() {
    try {
      const clinic = await this.find();
      if (clinic && clinic.test_list) {
        try {
          // Try to parse the test_list JSON
          const testList =
            typeof clinic.test_list === "string"
              ? JSON.parse(clinic.test_list)
              : clinic.test_list;

          return {
            ...clinic,
            test_list: testList,
          };
        } catch (parseError) {
          console.error("Error parsing test_list JSON:", parseError);
          // Return clinic without test_list if JSON is invalid
          return {
            ...clinic,
            test_list: [],
          };
        }
      }
      return clinic;
    } catch (error) {
      console.error("Database error in Clinic.getTestList:", error);
      throw error;
    }
  }
}

module.exports = Clinic;
