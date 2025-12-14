const mysql = require('mysql2/promise');

/**
 * Database Connection Module
 * Creates and exports a reusable database connection pool
 * Uses environment variables for configuration
 * 
 * CLOUD SQL CONNECTION:
 * This module is designed to work with Google Cloud SQL. To connect:
 * 
 * 1. For App Engine Standard Environment:
 *    - Cloud SQL connection is via Unix socket
 *    - Set DB_HOST to: /cloudsql/PROJECT_ID:REGION:INSTANCE_ID
 *    - Example: /cloudsql/my-project:us-central1:my-instance
 *    - DB_PORT is not needed for socket connections
 *    - Set DB_SSL=false (socket connections don't use SSL)
 * 
 * 2. For App Engine Flexible or Cloud Run:
 *    - Can use either Unix socket or TCP/IP
 *    - Socket: DB_HOST=/cloudsql/PROJECT_ID:REGION:INSTANCE_ID
 *    - TCP/IP: DB_HOST=INSTANCE_IP (private IP recommended)
 *    - DB_PORT=3306 (default MySQL port)
 *    - DB_SSL=true (recommended for TCP/IP connections)
 * 
 * 3. Required Environment Variables:
 *    - DB_HOST: Database hostname or socket path
 *    - DB_USER: Database username
 *    - DB_PASSWORD: Database password
 *    - DB_NAME: Database name
 *    - DB_PORT: Port number (optional, defaults to 3306)
 *    - DB_SSL: 'true' or 'false' (optional, defaults to false)
 * 
 * 4. Setting Environment Variables in App Engine:
 *    - Via app.yaml: Add 'env_variables' section
 *    - Via Cloud Console: App Engine > Settings > Environment Variables
 *    - Via Secret Manager: For sensitive credentials (recommended)
 */

// Database configuration from environment variables
// For local development with Cloud SQL Proxy:
//   - Run: cloud-sql-proxy PROJECT_ID:REGION:INSTANCE_ID
//   - Set DB_HOST=127.0.0.1, DB_PORT=3306 (or proxy's port)

const dbHost = process.env.DB_HOST || 'localhost';
const isUnixSocket = dbHost.startsWith('/cloudsql/');

// Base configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Connection pool settings
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Configure connection based on socket vs TCP/IP
if (isUnixSocket) {
  // Unix socket connection (App Engine Standard)
  dbConfig.socketPath = dbHost;
  // No SSL needed for Unix socket connections
} else {
  // TCP/IP connection (Cloud Run, Flexible, or local)
  dbConfig.host = dbHost;
  dbConfig.port = parseInt(process.env.DB_PORT || '3306', 10);
  // SSL configuration for TCP/IP connections
  if (process.env.DB_SSL === 'true') {
    dbConfig.ssl = {
      rejectUnauthorized: false
    };
  }
}

// Create connection pool
let pool = null;

/**
 * Initialize database connection pool
 * @returns {Promise<Object>} MySQL connection pool
 */
async function getPool() {
  if (!pool) {
    // Validate required environment variables
    if (!dbConfig.user || !dbConfig.password || !dbConfig.database) {
      throw new Error('Missing required database environment variables: DB_USER, DB_PASSWORD, DB_NAME');
    }

    pool = mysql.createPool(dbConfig);
    
    // Test the connection
    try {
      const connection = await pool.getConnection();
      console.log('Database connection established successfully');
      connection.release();
    } catch (error) {
      console.error('Database connection failed:', error.message);
      throw error;
    }
  }
  
  return pool;
}

/**
 * Get a connection from the pool
 * @returns {Promise<Object>} MySQL connection
 */
async function getConnection() {
  const poolInstance = await getPool();
  return await poolInstance.getConnection();
}

/**
 * Execute a query
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
async function query(sql, params) {
  const poolInstance = await getPool();
  const [results] = await poolInstance.execute(sql, params);
  return results;
}

/**
 * Close the connection pool
 * @returns {Promise<void>}
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection pool closed');
  }
}

module.exports = {
  getPool,
  getConnection,
  query,
  closePool
};
