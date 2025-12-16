-- Projects Table Schema
-- This table stores projects associated with clients
-- One client can have multiple projects (one-to-many relationship)

USE clientdb;

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'pending',
    budget DECIMAL(10, 2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Index for faster queries
    INDEX idx_client_id (client_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Verify the table was created
SHOW TABLES;

-- Check table structure
DESCRIBE projects;

-- Optional: Insert sample data
INSERT INTO projects (client_id, project_name, description, status, budget, start_date, end_date) VALUES
(1, 'Website Redesign', 'Complete overhaul of company website with modern UI/UX', 'in_progress', 15000.00, '2025-01-15', '2025-03-30'),
(1, 'Mobile App Development', 'Native iOS and Android app for customer portal', 'pending', 45000.00, '2025-02-01', '2025-06-30'),
(2, 'Cloud Migration', 'Migrate on-premise infrastructure to Google Cloud', 'in_progress', 25000.00, '2025-01-01', '2025-04-30'),
(3, 'Data Analytics Dashboard', 'Custom analytics dashboard using Power BI', 'completed', 12000.00, '2024-11-01', '2025-01-15');

-- Verify data was inserted
SELECT COUNT(*) as total_projects FROM projects;

