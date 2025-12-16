-- Migration: 001_create_projects_table
-- Description: Create projects table with foreign key to clients
-- Created: 2025-12-16

-- Create projects table only if it doesn't exist
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
    CONSTRAINT fk_project_client FOREIGN KEY (client_id) 
        REFERENCES clients(id) 
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    -- Indexes for faster queries
    INDEX idx_client_id (client_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert sample data only if table is empty
INSERT INTO projects (client_id, project_name, description, status, budget, start_date, end_date)
SELECT * FROM (
    SELECT 1 as client_id, 'Website Redesign' as project_name, 'Complete overhaul of company website with modern UI/UX' as description, 'in_progress' as status, 15000.00 as budget, '2025-01-15' as start_date, '2025-03-30' as end_date
    UNION ALL
    SELECT 1, 'Mobile App Development', 'Native iOS and Android app for customer portal', 'pending', 45000.00, '2025-02-01', '2025-06-30'
    UNION ALL
    SELECT 2, 'Cloud Migration', 'Migrate on-premise infrastructure to Google Cloud', 'in_progress', 25000.00, '2025-01-01', '2025-04-30'
    UNION ALL
    SELECT 3, 'Data Analytics Dashboard', 'Custom analytics dashboard using Power BI', 'completed', 12000.00, '2024-11-01', '2025-01-15'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM projects LIMIT 1);

