-- This file contains the database schema for reference
-- The actual database is created automatically by the application

-- Create database
CREATE DATABASE IF NOT EXISTS lis;
USE lis;

-- Disable foreign key checks for clean drops
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables if they exist
DROP TABLE IF EXISTS parameter_reference_ranges;
DROP TABLE IF EXISTS parameter_results;
DROP TABLE IF EXISTS test_results;
DROP TABLE IF EXISTS test_orders;
DROP TABLE IF EXISTS test_parameters;
DROP TABLE IF EXISTS dynamic_questions;
DROP TABLE IF EXISTS tests;
DROP TABLE IF EXISTS test_categories;
DROP TABLE IF EXISTS visits;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS clinics;
DROP TABLE IF EXISTS activity_logs;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create test_categories
CREATE TABLE test_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tests
CREATE TABLE tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(100),
  description TEXT,
  sample_type ENUM('serum','plasma','whole_blood','urine','other'),
  sample_volume VARCHAR(50),
  tube_type ENUM('EDTA','Heparin','Sodium Citrate','Serum Separator','Other'),
  processing_time VARCHAR(50),
  linear_range VARCHAR(100),
  testing_modes ENUM('standard','quick','both'),
  is_active TINYINT(1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES test_categories(id)
);

-- Create dynamic_questions
CREATE TABLE dynamic_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_id INT,
  question_text VARCHAR(255),
  field_type ENUM('checkbox','radio','dropdown','text'),
  options JSON,
  is_required TINYINT(1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (test_id) REFERENCES tests(id)
);

-- Create test_parameters
CREATE TABLE test_parameters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_id INT,
  parameter_name VARCHAR(100),
  unit VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (test_id) REFERENCES tests(id)
);

-- Create parameter_reference_ranges
CREATE TABLE parameter_reference_ranges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parameter_id INT NOT NULL,
  sample_type ENUM('serum','plasma','whole_blood','urine','other'),
  gender ENUM('male','female','both'),
  min_age INT,
  max_age INT,
  unit VARCHAR(50),
  min_value DECIMAL(10,3),
  max_value DECIMAL(10,3),
  critical_low DECIMAL(10,3),
  critical_high DECIMAL(10,3),
  conditions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parameter_id) REFERENCES test_parameters(id)
);

-- Create test_orders
CREATE TABLE test_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visit_id INT,
  test_id INT,
  status ENUM('ordered','sample_collected','in_progress','completed','cancelled'),
  priority ENUM('normal','urgent'),
  dynamic_answers JSON,
  ordered_by INT,
  ordered_at TIMESTAMP,
  sample_collected_at TIMESTAMP,
  completed_at TIMESTAMP,
  sample_type ENUM('serum','plasma','whole_blood','urine','other'),
  FOREIGN KEY (test_id) REFERENCES tests(id),
  FOREIGN KEY (visit_id) REFERENCES visits(id)
);

-- Create test_results
CREATE TABLE test_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_order_id INT,
  laboratorist_id INT,
  result_value VARCHAR(100),
  numeric_value DECIMAL(10,3),
  unit VARCHAR(50),
  status ENUM('normal','low','high','critical'),
  comments TEXT,
  interpretation TEXT,
  is_verified TINYINT(1),
  verified_by INT,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (test_order_id) REFERENCES test_orders(id)
);

-- Create parameter_results
CREATE TABLE parameter_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_result_id INT,
  parameter_id INT,
  result_value DECIMAL(10,3),
  string_value VARCHAR(100),
  unit VARCHAR(50),
  reference_min DECIMAL(10,3),
  reference_max DECIMAL(10,3),
  status ENUM('normal','low','high','critical'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (test_result_id) REFERENCES test_results(id),
  FOREIGN KEY (parameter_id) REFERENCES test_parameters(id)
);

-- Create patients
CREATE TABLE patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_number VARCHAR(50),
  full_name VARCHAR(100),
  date_of_birth DATE,
  gender ENUM('male','female'),
  phone VARCHAR(20),
  address TEXT,
  emergency_contact VARCHAR(20),
  email VARCHAR(100),
  blood_type ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-','unknown'),
  known_allergies TEXT,
  chronic_conditions TEXT,
  current_medications TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create visits
CREATE TABLE visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  receptionist_id INT,
  visit_date DATE,
  visit_time TIME,
  status ENUM('registered','sample_collected','in_progress','completed','cancelled'),
  priority ENUM('routine','urgent','emergency'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (receptionist_id) REFERENCES users(id)
);

-- Create users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(100),
  password VARCHAR(255),
  role ENUM('admin','receptionist','laboratorist','patient'),
  full_name VARCHAR(100),
  phone VARCHAR(20),
  is_active TINYINT(1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create clinics
CREATE TABLE clinics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  logo_url VARCHAR(500),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  about_text TEXT,
  working_hours TEXT,
  test_list JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create activity_logs
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);