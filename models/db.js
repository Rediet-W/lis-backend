const pool = require("../config/database");
const bcrypt = require("bcryptjs");

const initDatabase = async () => {
  let connection;
  try {
    console.log("🗄️  Initializing database...");

    connection = await pool.getConnection();

    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'receptionist', 'laboratorist', 'patient', 'pathologist') NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Clinics table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS clinics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        logo_url VARCHAR(500),
        address TEXT,
        phone VARCHAR(20),
        email VARCHAR(100),
        about_text TEXT,
        working_hours TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Patients table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS patients (
        id INT PRIMARY KEY AUTO_INCREMENT,
        card_number VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        age INT NOT NULL,
        gender ENUM('male', 'female') NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT,
        emergency_contact VARCHAR(20),
        email VARCHAR(100),
        blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'),
        known_allergies TEXT,
        chronic_conditions TEXT,
        current_medications TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Patient visits table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS visits (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT NOT NULL,
        receptionist_id INT NOT NULL,
        visit_date DATE NOT NULL,
        visit_time TIME NOT NULL,
        status ENUM('registered', 'sample_collected', 'in_progress', 'completed', 'cancelled') DEFAULT 'registered',
        priority ENUM('routine', 'urgent', 'emergency') DEFAULT 'routine',
        special_instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (receptionist_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Test categories
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS test_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Main tests table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        sample_type_id INT NOT NULL,
        sample_volume VARCHAR(50),
        tube_type ENUM('EDTA', 'Heparin', 'Sodium Citrate', 'Serum Separator', 'Other'),
        processing_time VARCHAR(50),
        linear_range VARCHAR(100),
        testing_modes ENUM('standard', 'quick', 'both') DEFAULT 'standard',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES test_categories(id) ON DELETE CASCADE
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sample_types (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        is_active TINYINT(1) DEFAULT 1,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Reference ranges table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS test_reference_ranges (
        id INT PRIMARY KEY AUTO_INCREMENT,
        test_id INT NOT NULL,
        gender ENUM('male', 'female', 'both') DEFAULT 'both',
        min_age INT,
        max_age INT,
        min_value DECIMAL(10,3),
        max_value DECIMAL(10,3),
        unit VARCHAR(50) NOT NULL,
        critical_low DECIMAL(10,3),
        critical_high DECIMAL(10,3),
        conditions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
      )
    `);

    // Dynamic questions for tests
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS dynamic_questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        test_id INT NOT NULL,
        question_text VARCHAR(255) NOT NULL,
        field_type ENUM('checkbox', 'radio', 'dropdown', 'text') DEFAULT 'checkbox',
        options JSON,
        is_required BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
      )
    `);

    // Test orders table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS test_orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        visit_id INT NOT NULL,
        test_id INT NOT NULL,
        status ENUM('ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled') DEFAULT 'ordered',
        priority ENUM('normal', 'urgent') DEFAULT 'normal',
        dynamic_answers JSON,
        ordered_by INT NOT NULL,
        ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sample_collected_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
        FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
        FOREIGN KEY (ordered_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Test parameters table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS test_parameters (
        id INT PRIMARY KEY AUTO_INCREMENT,
        test_id INT NOT NULL,
        parameter_name VARCHAR(100) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
      )
    `);

    // Test results table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS test_results (
        id INT PRIMARY KEY AUTO_INCREMENT,
        test_order_id INT NOT NULL,
        laboratorist_id INT NOT NULL,
        result_value VARCHAR(100),
        numeric_value DECIMAL(10,3),
        unit VARCHAR(50),
        status ENUM('normal', 'low', 'high', 'critical') DEFAULT 'normal',
        comments TEXT,
        interpretation TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        verified_by INT,
        verified_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (test_order_id) REFERENCES test_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (laboratorist_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Parameter results table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS parameter_results (
        id INT PRIMARY KEY AUTO_INCREMENT,
        test_result_id INT NOT NULL,
        parameter_id INT NOT NULL,
        result_value DECIMAL(10,3),
        string_value VARCHAR(100),
        unit VARCHAR(50),
        reference_min DECIMAL(10,3),
        reference_max DECIMAL(10,3),
        status ENUM('normal', 'low', 'high', 'critical') DEFAULT 'normal',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE,
        FOREIGN KEY (parameter_id) REFERENCES test_parameters(id) ON DELETE CASCADE
      )
    `);

    // Activity logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.execute(`
      CREATE TABLE pathologist_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_order_id INT NOT NULL,
    pathologist_id INT NOT NULL,
    report_data JSON NOT NULL, 
    images JSON, 
    overall_comments TEXT,
    status ENUM('draft', 'completed', 'verified') DEFAULT 'draft',
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by INT,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (test_order_id) REFERENCES test_orders(id),
    FOREIGN KEY (pathologist_id) REFERENCES users(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
); `);

    console.log("✅ All tables created successfully!");

    connection.release();
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    if (connection) connection.release();
    throw error;
  }
};

module.exports = { initDatabase };
