/**
 * Database Migration Runner
 * Automatically runs pending migrations and tracks execution
 * 
 * Features:
 * - Creates migrations tracking table automatically
 * - Executes pending migrations in order
 * - Records executed migrations
 * - Idempotent (safe to run multiple times)
 * - Handles existing tables gracefully
 */

require('dotenv').config();
const db = require('./db');
const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const MIGRATIONS_TABLE = 'schema_migrations';

/**
 * Create migrations tracking table if it doesn't exist
 */
async function ensureMigrationsTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_migration_name (migration_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Migrations table ready');
  } catch (error) {
    console.error('Error creating migrations table:', error);
    throw error;
  }
}

/**
 * Get list of executed migrations
 */
async function getExecutedMigrations() {
  try {
    const results = await db.query(
      `SELECT migration_name FROM ${MIGRATIONS_TABLE} ORDER BY executed_at`
    );
    return results.map(row => row.migration_name);
  } catch (error) {
    console.error('Error fetching executed migrations:', error);
    throw error;
  }
}

/**
 * Get list of migration files
 */
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log('No migrations directory found, creating...');
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    return [];
  }
  
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();
}

/**
 * Execute a single migration file
 */
async function executeMigration(migrationFile) {
  const migrationPath = path.join(MIGRATIONS_DIR, migrationFile);
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  // Split by semicolon and filter empty statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`\n📦 Running migration: ${migrationFile}`);
  
  try {
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await db.query(statement);
      }
    }
    
    // Record migration as executed
    await db.query(
      `INSERT INTO ${MIGRATIONS_TABLE} (migration_name) VALUES (?)`,
      [migrationFile]
    );
    
    console.log(`✓ Migration ${migrationFile} completed successfully`);
    return true;
  } catch (error) {
    // Check if it's a "table already exists" error (acceptable)
    if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message.includes('already exists')) {
      console.log(`⚠ Migration ${migrationFile} already applied (table exists), marking as executed`);
      // Still record it to prevent re-running
      try {
        await db.query(
          `INSERT IGNORE INTO ${MIGRATIONS_TABLE} (migration_name) VALUES (?)`,
          [migrationFile]
        );
      } catch (ignoreError) {
        // Ignore duplicate entry errors
      }
      return true;
    }
    
    console.error(`✗ Migration ${migrationFile} failed:`, error.message);
    throw error;
  }
}

/**
 * Run all pending migrations
 */
async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');
  
  try {
    // Ensure migrations table exists
    await ensureMigrationsTable();
    
    // Get executed and pending migrations
    const executed = await getExecutedMigrations();
    const allMigrations = getMigrationFiles();
    const pending = allMigrations.filter(m => !executed.includes(m));
    
    if (pending.length === 0) {
      console.log('✓ No pending migrations. Database is up to date.');
      return;
    }
    
    console.log(`Found ${pending.length} pending migration(s):`);
    pending.forEach(m => console.log(`  - ${m}`));
    
    // Execute pending migrations
    for (const migration of pending) {
      await executeMigration(migration);
    }
    
    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.closePool();
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runMigrations };

