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
      SELECT to.*, t.name as test_name, t.sample_type, 
             v.visit_date, v.visit_time, p.full_name as patient_name, p.card_number,
             u.full_name as ordered_by_name, tc.name as category_name
      FROM test_orders to
      JOIN tests t ON to.test_id = t.id
      JOIN visits v ON to.visit_id = v.id
      JOIN patients p ON v.patient_id = p.id
      LEFT JOIN users u ON to.ordered_by = u.id
      LEFT JOIN test_categories tc ON t.category_id = tc.id
      ${clause}
      ORDER BY to.ordered_at DESC
    `;

    const [rows] = await pool.execute(query, values);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT to.*, t.name as test_name, t.description as test_description, t.sample_type,
              v.visit_date, v.visit_time, p.full_name as patient_name, p.card_number, 
              p.date_of_birth, p.gender, u.full_name as ordered_by_name
       FROM test_orders to
       JOIN tests t ON to.test_id = t.id
       JOIN visits v ON to.visit_id = v.id
       JOIN patients p ON v.patient_id = p.id
       LEFT JOIN users u ON to.ordered_by = u.id
       WHERE to.id = ?`,
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
      `SELECT to.*, t.name as test_name, p.full_name as patient_name, p.card_number
       FROM test_orders to
       JOIN tests t ON to.test_id = t.id
       JOIN visits v ON to.visit_id = v.id
       JOIN patients p ON v.patient_id = p.id
       WHERE to.status IN ('ordered', 'sample_collected', 'in_progress')
       ORDER BY to.priority DESC, to.ordered_at ASC`
    );
    return rows;
  }
}

module.exports = TestOrder;
