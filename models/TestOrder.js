const { pool } = require("../config/database");
const {
  buildInsertQuery,
  buildUpdateQuery,
  buildWhereClause,
} = require("../utils/queryUtils");

class TestOrder {
  static async findAll(filters = {}) {
    const { clause, values } = buildWhereClause(filters);
    const query = `
      SELECT o.*, t.name as test_name, st.name as sample_type, 
             v.visit_date, v.visit_time, p.full_name as patient_name, p.card_number, p.age as patient_age, p.gender as patient_gender,
             u.full_name as ordered_by_name, tc.name as category_name
      FROM test_orders o
      JOIN tests t ON o.test_id = t.id
      LEFT JOIN sample_types st ON t.sample_type_id = st.id
      JOIN visits v ON o.visit_id = v.id
      JOIN patients p ON v.patient_id = p.id
      LEFT JOIN users u ON o.ordered_by = u.id
      LEFT JOIN test_categories tc ON t.category_id = tc.id
      ${clause}
      ORDER BY o.ordered_at DESC
    `;

    const [rows] = await pool.execute(query, values);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT o.*, t.name as test_name, t.description as test_description, st.name as sample_type,
              v.visit_date, v.visit_time, p.full_name as patient_name, p.card_number, 
              p.age as patient_age, p.gender as patient_gender, u.full_name as ordered_by_name
       FROM test_orders o
       JOIN tests t ON o.test_id = t.id
       LEFT JOIN sample_types st ON t.sample_type_id = st.id
       JOIN visits v ON o.visit_id = v.id
       JOIN patients p ON v.patient_id = p.id
       LEFT JOIN users u ON o.ordered_by = u.id
       WHERE o.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(orderData) {
    const { query, values } = buildInsertQuery("test_orders", orderData);
    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...orderData };
  }

  static async update(id, orderData) {
    const { query, values } = buildUpdateQuery("test_orders", orderData, {
      id,
    });
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async updateStatus(id, status, timestampField = null) {
    let query = "UPDATE test_orders SET status = ?";
    const values = [status, id];

    if (timestampField) {
      query += `, ${timestampField} = CURRENT_TIMESTAMP`;
    }

    query += " WHERE id = ?";

    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async getResults(testOrderId) {
    const [rows] = await pool.execute(
      `SELECT tr.*, u.full_name as laboratorist_name, 
              verifier.full_name as verified_by_name
       FROM test_results tr
       LEFT JOIN users u ON tr.laboratorist_id = u.id
       LEFT JOIN users verifier ON tr.verified_by = verifier.id
       WHERE tr.test_order_id = ?`,
      [testOrderId]
    );
    return rows;
  }

  static async getPendingOrders() {
    const [rows] = await pool.execute(
      `SELECT o.*, t.name as test_name, p.full_name as patient_name, p.card_number, p.age as patient_age, p.gender as patient_gender
       FROM test_orders o
       JOIN tests t ON o.test_id = t.id
       JOIN visits v ON o.visit_id = v.id
       JOIN patients p ON v.patient_id = p.id
       WHERE o.status IN ('ordered', 'sample_collected', 'in_progress')
       ORDER BY o.priority DESC, o.ordered_at ASC`
    );
    return rows;
  }
}

module.exports = TestOrder;
