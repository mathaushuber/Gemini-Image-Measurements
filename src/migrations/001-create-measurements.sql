CREATE DATABASE IF NOT EXISTS water_gas_db;

USE water_gas_db;

CREATE TABLE IF NOT EXISTS measurements (
    measure_uuid VARCHAR(255) NOT NULL,
    customer_code VARCHAR(50) NOT NULL,
    measure_type ENUM('WATER', 'GAS') NOT NULL,
    measure_value INT UNSIGNED NOT NULL,
    measure_datetime DATETIME NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    has_confirmed BOOLEAN DEFAULT FALSE,
    measure_year YEAR AS (YEAR(measure_datetime)) STORED,
    measure_month TINYINT AS (MONTH(measure_datetime)) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_measure_per_month (customer_code, measure_type, measure_year, measure_month)
);
