-- Database Setup Script for Client Information System
-- Run this script to create the database and table

-- Step 1: Create the database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS clientdb;

-- Step 2: Use the database
USE clientdb;

-- Step 3: Create the clients table
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    company VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Verify the table was created
SHOW TABLES;

-- Step 5: Check table structure
DESCRIBE clients;
