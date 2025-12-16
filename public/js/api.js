/**
 * API Client Module
 * Provides reusable functions for interacting with the REST API
 */

const API_BASE = '/api/clients';

/**
 * Get all clients from the API
 * @returns {Promise<Array>} Array of client objects
 */
async function getAllClients() {
  try {
    const response = await fetch(API_BASE);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch clients');
    }
    
    return data.data || [];
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
}

/**
 * Get a single client by ID
 * @param {number} id - Client ID
 * @returns {Promise<Object>} Client object
 */
async function getClient(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Failed to fetch client ${id}`);
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching client:', error);
    throw error;
  }
}

/**
 * Create a new client
 * @param {Object} clientData - Client data object
 * @param {string} clientData.full_name - Client's full name
 * @param {string} clientData.email - Client's email
 * @param {string} clientData.phone - Client's phone number
 * @param {string} clientData.company - Client's company
 * @returns {Promise<Object>} Created client object
 */
async function createClient(clientData) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clientData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create client');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
}

/**
 * Update an existing client
 * @param {number} id - Client ID
 * @param {Object} clientData - Updated client data
 * @returns {Promise<Object>} Updated client object
 */
async function updateClient(id, clientData) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clientData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update client');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
}

/**
 * Delete a client
 * @param {number} id - Client ID
 * @returns {Promise<Object>} Deleted client object
 */
async function deleteClient(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete client');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
}

/**
 * Get total client count
 * @returns {Promise<number>} Total number of clients
 */
async function getClientCount() {
  try {
    const response = await fetch(`${API_BASE}/count`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get client count');
    }
    
    return data.count;
  } catch (error) {
    console.error('Error getting client count:', error);
    throw error;
  }
}

