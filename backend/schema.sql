-- Hafriyat Firma Takip Uygulaması - MySQL Şeması
-- Not: Multi-tenant izolasyonu için tüm tablolarda company_id vardır.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS companies (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_settings (
  id BIGINT NOT NULL AUTO_INCREMENT,
  company_id BIGINT NOT NULL,
  enable_income_tracking TINYINT(1) NOT NULL DEFAULT 0,
  enable_driver_job_entry TINYINT(1) NOT NULL DEFAULT 0,
  enable_advanced_reports TINYINT(1) NOT NULL DEFAULT 0,
  enable_future_modules TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_company_settings_company_id (company_id),
  KEY ix_company_settings_company_id (company_id),
  CONSTRAINT fk_company_settings_company
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  company_id BIGINT NOT NULL,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','driver') NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_company_phone (company_id, phone),
  KEY ix_users_company_id (company_id),
  KEY ix_users_phone (phone),
  KEY ix_users_role (role),
  KEY ix_users_is_active (is_active),
  CONSTRAINT fk_users_company
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT NOT NULL AUTO_INCREMENT,
  company_id BIGINT NOT NULL,
  plate VARCHAR(20) NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehicles_company_plate (company_id, plate),
  KEY ix_vehicles_company_id (company_id),
  KEY ix_vehicles_plate (plate),
  KEY ix_vehicles_is_active (is_active),
  CONSTRAINT fk_vehicles_company
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS jobs (
  id BIGINT NOT NULL AUTO_INCREMENT,
  company_id BIGINT NOT NULL,
  date DATE NOT NULL,
  vehicle_id BIGINT NOT NULL,
  driver_id BIGINT NOT NULL,
  job_type VARCHAR(50) NOT NULL,
  from_location VARCHAR(200) NOT NULL,
  to_location VARCHAR(200) NOT NULL,
  trip_count INT NOT NULL DEFAULT 1,
  income_amount DECIMAL(12,2) NULL,
  description TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_jobs_company_id (company_id),
  KEY ix_jobs_date (date),
  KEY ix_jobs_vehicle_id (vehicle_id),
  KEY ix_jobs_driver_id (driver_id),
  KEY ix_jobs_company_date (company_id, date),
  KEY ix_jobs_company_driver_date (company_id, driver_id, date),
  KEY ix_jobs_company_vehicle_date (company_id, vehicle_id, date),
  CONSTRAINT fk_jobs_company
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_jobs_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_jobs_driver
    FOREIGN KEY (driver_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS expenses (
  id BIGINT NOT NULL AUTO_INCREMENT,
  company_id BIGINT NOT NULL,
  date DATE NOT NULL,
  vehicle_id BIGINT NOT NULL,
  expense_type VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_expenses_company_id (company_id),
  KEY ix_expenses_date (date),
  KEY ix_expenses_vehicle_id (vehicle_id),
  KEY ix_expenses_company_date (company_id, date),
  KEY ix_expenses_company_vehicle_date (company_id, vehicle_id, date),
  CONSTRAINT fk_expenses_company
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_expenses_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
