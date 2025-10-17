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
        role ENUM('admin', 'receptionist', 'laboratorist', 'patient') NOT NULL,
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
        date_of_birth DATE NOT NULL,
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
        sample_type ENUM('serum', 'plasma', 'whole_blood', 'urine', 'other') NOT NULL,
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

    console.log("✅ All tables created successfully!");

    // Insert sample data
    await insertSampleData(connection);

    connection.release();
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    if (connection) connection.release();
    throw error;
  }
};

const insertSampleData = async (connection) => {
  try {
    console.log("📥 Inserting sample data...");

    // Create default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await connection.execute(
      `INSERT IGNORE INTO users (username, email, password_hash, role, full_name, phone) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "admin",
        "admin@finecare.com",
        hashedPassword,
        "admin",
        "System Administrator",
        "+1234567890",
      ]
    );

    // Create sample receptionist and laboratorist
    await connection.execute(
      `INSERT IGNORE INTO users (username, email, password_hash, role, full_name, phone) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "reception",
        "reception@finecare.com",
        await bcrypt.hash("reception123", 10),
        "receptionist",
        "Receptionist User",
        "+1234567891",
      ]
    );

    await connection.execute(
      `INSERT IGNORE INTO users (username, email, password_hash, role, full_name, phone) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "labtech",
        "lab@finecare.com",
        await bcrypt.hash("labtech123", 10),
        "laboratorist",
        "Lab Technician",
        "+1234567892",
      ]
    );

    // Insert clinic info
    await connection.execute(
      `INSERT IGNORE INTO clinics (name, address, phone, email, about_text, working_hours) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "FineCare Medical Laboratory",
        "123 Health Street, Medical City, MC 12345",
        "+1-234-567-8900",
        "info@finecare.com",
        "Leading medical laboratory providing accurate and timely diagnostic services with state-of-the-art technology and experienced professionals.",
        "Mon-Fri: 7:00 AM - 7:00 PM, Sat: 8:00 AM - 4:00 PM, Sun: Closed",
      ]
    );

    // Insert test categories
    const categories = [
      ["Vitamin Tests", "Comprehensive vitamin level testing"],
      ["Inflammation Markers", "Tests for inflammation and immune response"],
      ["Diabetes Panel", "Blood sugar and diabetes-related tests"],
      ["Thyroid Function", "Thyroid hormone level tests"],
      ["Complete Blood Count", "Complete blood count and components"],
      ["Liver Function", "Liver enzyme and function tests"],
      ["Kidney Function", "Kidney function and renal panel tests"],
    ];

    for (const category of categories) {
      await connection.execute(
        "INSERT IGNORE INTO test_categories (name, description) VALUES (?, ?)",
        category
      );
    }

    // Get category IDs
    const [categoryRows] = await connection.execute(
      "SELECT id, name FROM test_categories"
    );
    const categoryMap = {};
    categoryRows.forEach((cat) => {
      categoryMap[cat.name] = cat.id;
    });

    // Insert sample tests with proper categories
    const tests = [
      [
        categoryMap["Vitamin Tests"],
        "Vitamin D",
        "25-Hydroxy Vitamin D Test",
        "serum",
        "5 mL",
        "Serum Separator",
        "24 hours",
        "10-100 ng/mL",
        "standard",
      ],
      [
        categoryMap["Vitamin Tests"],
        "Vitamin B12",
        "Vitamin B12 Level",
        "serum",
        "3 mL",
        "Serum Separator",
        "24 hours",
        "200-900 pg/mL",
        "standard",
      ],
      [
        categoryMap["Inflammation Markers"],
        "CRP",
        "C-Reactive Protein",
        "serum",
        "2 mL",
        "Serum Separator",
        "4 hours",
        "0.0-5.0 mg/L",
        "both",
      ],
      [
        categoryMap["Inflammation Markers"],
        "ESR",
        "Erythrocyte Sedimentation Rate",
        "whole_blood",
        "2 mL",
        "EDTA",
        "1 hour",
        "0-20 mm/hr",
        "standard",
      ],
      [
        categoryMap["Diabetes Panel"],
        "HbA1c",
        "Glycated Hemoglobin",
        "whole_blood",
        "2 mL",
        "EDTA",
        "24 hours",
        "4.0-5.6%",
        "standard",
      ],
      [
        categoryMap["Diabetes Panel"],
        "Fasting Glucose",
        "Fasting Blood Sugar",
        "serum",
        "2 mL",
        "Fluoride",
        "2 hours",
        "70-100 mg/dL",
        "standard",
      ],
      [
        categoryMap["Thyroid Function"],
        "TSH",
        "Thyroid Stimulating Hormone",
        "serum",
        "3 mL",
        "Serum Separator",
        "24 hours",
        "0.4-4.0 mIU/L",
        "standard",
      ],
      [
        categoryMap["Thyroid Function"],
        "Free T4",
        "Free Thyroxine",
        "serum",
        "3 mL",
        "Serum Separator",
        "24 hours",
        "0.8-1.8 ng/dL",
        "standard",
      ],
      [
        categoryMap["Complete Blood Count"],
        "CBC",
        "Complete Blood Count",
        "whole_blood",
        "3 mL",
        "EDTA",
        "2 hours",
        "N/A",
        "standard",
      ],
      [
        categoryMap["Liver Function"],
        "ALT",
        "Alanine Aminotransferase",
        "serum",
        "3 mL",
        "Serum Separator",
        "24 hours",
        "7-56 U/L",
        "standard",
      ],
    ];

    for (const test of tests) {
      await connection.execute(
        `INSERT IGNORE INTO tests (category_id, name, description, sample_type, sample_volume, tube_type, processing_time, linear_range, testing_modes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        test
      );
    }

    // Get test IDs
    const [testRows] = await connection.execute("SELECT id, name FROM tests");
    const testMap = {};
    testRows.forEach((test) => {
      testMap[test.name] = test.id;
    });

    // Insert reference ranges with pregnancy conditions
    const referenceRanges = [
      // Vitamin D - different ranges for age/gender
      [
        testMap["Vitamin D"],
        "both",
        18,
        65,
        30,
        100,
        "ng/mL",
        10,
        150,
        "general",
      ],
      [
        testMap["Vitamin D"],
        "both",
        65,
        150,
        30,
        100,
        "ng/mL",
        10,
        150,
        "elderly",
      ],

      // CRP - general range
      [testMap["CRP"], "both", 0, 150, 0.0, 5.0, "mg/L", 0.0, 10.0, "general"],

      // HbA1c - with pregnancy condition
      [testMap["HbA1c"], "both", 18, 65, 4.0, 5.6, "%", 3.5, 6.4, "general"],
      [testMap["HbA1c"], "female", 18, 45, 4.0, 5.6, "%", 3.5, 6.4, "pregnant"],

      // Fasting Glucose - with pregnancy condition
      [
        testMap["Fasting Glucose"],
        "both",
        18,
        65,
        70,
        100,
        "mg/dL",
        50,
        126,
        "general",
      ],
      [
        testMap["Fasting Glucose"],
        "female",
        18,
        45,
        60,
        95,
        "mg/dL",
        50,
        126,
        "pregnant",
      ],

      // TSH - with pregnancy condition
      [testMap["TSH"], "both", 18, 65, 0.4, 4.0, "mIU/L", 0.1, 10.0, "general"],
      [
        testMap["TSH"],
        "female",
        18,
        45,
        0.4,
        4.0,
        "mIU/L",
        0.1,
        10.0,
        "pregnant",
      ],

      // ALT - gender specific
      [testMap["ALT"], "male", 18, 65, 10, 40, "U/L", 5, 100, "general"],
      [testMap["ALT"], "female", 18, 65, 7, 35, "U/L", 5, 100, "general"],
    ];

    for (const range of referenceRanges) {
      await connection.execute(
        `INSERT IGNORE INTO test_reference_ranges 
         (test_id, gender, min_age, max_age, min_value, max_value, unit, critical_low, critical_high, conditions) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        range
      );
    }

    // Insert dynamic questions for tests
    const dynamicQuestions = [
      [
        testMap["Vitamin D"],
        "Have you been taking vitamin D supplements?",
        "checkbox",
        JSON.stringify(["Yes", "No"]),
        false,
      ],
      [
        testMap["HbA1c"],
        "Are you currently pregnant?",
        "radio",
        JSON.stringify(["Yes", "No", "Not Sure"]),
        true,
      ],
      [
        testMap["Fasting Glucose"],
        "Did you fast for 8-12 hours before this test?",
        "radio",
        JSON.stringify(["Yes", "No"]),
        true,
      ],
      [
        testMap["Fasting Glucose"],
        "Are you currently pregnant?",
        "radio",
        JSON.stringify(["Yes", "No", "Not Sure"]),
        false,
      ],
      [
        testMap["TSH"],
        "Are you currently taking thyroid medication?",
        "checkbox",
        JSON.stringify(["Yes", "No"]),
        false,
      ],
      [
        testMap["TSH"],
        "Are you currently pregnant?",
        "radio",
        JSON.stringify(["Yes", "No", "Not Sure"]),
        false,
      ],
    ];

    for (const question of dynamicQuestions) {
      await connection.execute(
        `INSERT IGNORE INTO dynamic_questions 
         (test_id, question_text, field_type, options, is_required) 
         VALUES (?, ?, ?, ?, ?)`,
        question
      );
    }

    // Insert test parameters for CBC
    const cbcParameters = [
      [testMap["CBC"], "Hemoglobin", "g/dL"],
      [testMap["CBC"], "WBC Count", "10^3/μL"],
      [testMap["CBC"], "Platelet Count", "10^3/μL"],
      [testMap["CBC"], "RBC Count", "10^6/μL"],
      [testMap["CBC"], "Hematocrit", "%"],
    ];

    for (const param of cbcParameters) {
      await connection.execute(
        "INSERT IGNORE INTO test_parameters (test_id, parameter_name, unit) VALUES (?, ?, ?)",
        param
      );
    }

    console.log("✅ Sample data inserted successfully!");
  } catch (error) {
    console.error("❌ Error inserting sample data:", error);
  }
};

module.exports = { initDatabase };
