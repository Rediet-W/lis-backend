-- This file contains the database schema for reference
-- The actual database is created automatically by the application

-- Create database
CREATE DATABASE IF NOT EXISTS medical_lis;
USE medical_lis;

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  patient_id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  is_pregnant BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tests table
CREATE TABLE IF NOT EXISTS tests (
  test_id INT PRIMARY KEY AUTO_INCREMENT,
  test_code VARCHAR(50) UNIQUE NOT NULL,
  test_name VARCHAR(255) NOT NULL,
  test_unit VARCHAR(50),
  description TEXT,
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reference ranges table (Handles different normal ranges)
CREATE TABLE IF NOT EXISTS reference_ranges (
  range_id INT PRIMARY KEY AUTO_INCREMENT,
  test_id INT NOT NULL,
  gender ENUM('Male', 'Female', 'Any') DEFAULT 'Any',
  min_age INT DEFAULT 0,
  max_age INT DEFAULT 150,
  is_pregnant BOOLEAN DEFAULT FALSE,
  normal_min DECIMAL(10, 2),
  normal_max DECIMAL(10, 2),
  notes TEXT,
  FOREIGN KEY (test_id) REFERENCES tests(test_id) ON DELETE CASCADE,
  UNIQUE KEY unique_condition (test_id, gender, min_age, max_age, is_pregnant)
);

-- Test results table
CREATE TABLE IF NOT EXISTS test_results (
  result_id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  test_id INT NOT NULL,
  result_value DECIMAL(10, 2) NOT NULL,
  result_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Pending', 'Completed', 'Abnormal') DEFAULT 'Pending',
  interpretation VARCHAR(50),
  notes TEXT,
  performed_by VARCHAR(100),
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (test_id) REFERENCES tests(test_id) ON DELETE CASCADE,
  INDEX idx_patient_date (patient_id, result_date),
  INDEX idx_test_date (test_id, result_date)
);