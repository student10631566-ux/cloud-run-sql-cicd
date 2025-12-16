/**
 * Secret Manager Integration
 * Fetches secrets from Google Cloud Secret Manager at runtime
 * This ensures secrets are never stored in code or configuration files
 */

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

let secretManagerClient = null;
let cachedSecrets = {};

/**
 * Initialize Secret Manager client
 */
function getSecretManagerClient() {
  if (!secretManagerClient) {
    secretManagerClient = new SecretManagerServiceClient();
  }
  return secretManagerClient;
}

/**
 * Fetch secret from Google Cloud Secret Manager
 * @param {string} secretName - Name of the secret (e.g., 'db-password')
 * @returns {Promise<string>} - Secret value
 */
async function getSecret(secretName) {
  // Return cached secret if available
  if (cachedSecrets[secretName]) {
    console.log(`Using cached secret: ${secretName}`);
    return cachedSecrets[secretName];
  }

  try {
    const client = getSecretManagerClient();
    
    // Get project ID from environment (automatically set in App Engine)
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || 'enhanced-oasis-481009-n3';
    
    // Build secret version name
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
    
    console.log(`Fetching secret: ${secretName} from Secret Manager...`);
    
    // Access the secret
    const [version] = await client.accessSecretVersion({ name });
    
    // Extract and decode the payload
    const secretValue = version.payload.data.toString('utf8').trim();
    
    // Cache the secret
    cachedSecrets[secretName] = secretValue;
    
    console.log(`✓ Secret ${secretName} retrieved successfully`);
    
    return secretValue;
  } catch (error) {
    console.error(`Error fetching secret ${secretName}:`, error.message);
    throw new Error(`Failed to fetch secret ${secretName}: ${error.message}`);
  }
}

/**
 * Get database password from Secret Manager
 * @returns {Promise<string>} - Database password
 */
async function getDbPassword() {
  // Check if we're in local development (using .env file)
  if (process.env.DB_PASSWORD && !process.env.DB_PASSWORD_SECRET) {
    console.log('Using DB_PASSWORD from environment (local development)');
    return process.env.DB_PASSWORD;
  }
  
  // Get secret name from environment variable
  const secretName = process.env.DB_PASSWORD_SECRET || 'db-password';
  
  return await getSecret(secretName);
}

/**
 * Clear cached secrets (useful for testing)
 */
function clearCache() {
  cachedSecrets = {};
}

module.exports = {
  getSecret,
  getDbPassword,
  clearCache
};

