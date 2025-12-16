const mysql = require('mysql2/promise');
const { getDbPassword } = require('./secrets');

/**
 * Database Connection Module
 * Creates and exports a reusable database connection pool
 * Uses environment variables for configuration
 * 
 * CLOUD SQL CONNECTION WITH SECRET MANAGER:
 * This module fetches the database password from Google Cloud Secret Manager at runtime
 * 
 * 1. For App Engine (Production):
 *    - DB_HOST: /cloudsql/PROJECT_ID:REGION:INSTANCE_ID (Unix socket)
 *    - DB_USER: Database username
 *    - DB_PASSWORD_SECRET: Name of secret in Secret Manager
 *    - DB_NAME: Database name
 *    - Password is fetched from Secret Manager at runtime
 * 
 * 2. For Local Development:
 *    - DB_HOST: 127.0.0.1 (via Cloud SQL Proxy)
 *    - DB_USER: Database username
 *    - DB_PASSWORD: Password directly from .env file
 *    - DB_NAME: Database name
 * 
 * 3. Required Environment Variables:
 *    - DB_HOST: Database hostname or socket path
 *    - DB_USER: Database username
 *    - DB_PASSWORD_SECRET: Secret name (production) OR DB_PASSWORD (local)
 *    - DB_NAME: Database name
 *    - DB_PORT: Port number (optional, defaults to 3306)
 *    - DB_SSL: 'true' or 'false' (optional, defaults to false)
 */

// Database configuration from environment variables
const dbHost = process.env.DB_HOST || 'localhost';
const isUnixSocket = dbHost.startsWith('/cloudsql/');

// Create connection pool
let pool = null;

/**
 * Build database configuration
 * Fetches password from Secret Manager if needed
 */
async function buildDbConfig() {
  // Fetch password from Secret Manager (or use local env var)
  const password = await getDbPassword();
  
  // Base configuration
  const config = {
    user: process.env.DB_USER,
    password: password,
    database: process.env.DB_NAME,
    // Connection pool settings
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
  
  // Configure connection based on socket vs TCP/IP
  if (isUnixSocket) {
    // Unix socket connection (App Engine Standard)
    config.socketPath = dbHost;
    console.log(`Connecting via Unix socket: ${dbHost}`);
  } else {
    // TCP/IP connection (Cloud Run, Flexible, or local)
    config.host = dbHost;
    config.port = parseInt(process.env.DB_PORT || '3306', 10);
    console.log(`Connecting via TCP/IP: ${config.host}:${config.port}`);
    
    // SSL configuration for TCP/IP connections
    if (process.env.DB_SSL === 'true') {
      config.ssl = {
        rejectUnauthorized: false
      };
    }
  }
  
  return config;
}

/**
 * Initialize database connection pool
 * @returns {Promise<Object>} MySQL connection pool
 */
async function getPool() {
  if (!pool) {
    try {
      // Build configuration (includes fetching secret)
      const dbConfig = await buildDbConfig();
      
      // Validate required configuration
      if (!dbConfig.user || !dbConfig.password || !dbConfig.database) {
        throw new Error('Missing required database configuration: DB_USER, password, DB_NAME');
      }
      
      // Create the pool
      pool = mysql.createPool(dbConfig);
      
      // Test the connection
      const connection = await pool.getConnection();
      console.log('✓ Database connection established successfully');
      connection.release();
    } catch (error) {
      console.error('✗ Database connection failed:', error.message);
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
