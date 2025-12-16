// Load environment variables from .env file (for local development)
require('dotenv').config();

const express = require("express");
const app = express();
const db = require("./db");

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from 'public' directory
app.use(express.static('public'));

// ============================================
// API STATUS ENDPOINT
// ============================================

// API status endpoint (moved from "/" to avoid conflict with static index.html)
app.get("/api/status", async (req, res) => {
  try {
    const rows = await db.query("SELECT COUNT(*) AS total FROM clients");
    const totalClients = rows[0].total;

    res.send(`
      <html>
        <head>
          <title>Client Information System</title>
        </head>
        <body>
          <h1>Client Information System</h1>
          <p>
            Welcome to the Client Information System.
            This system helps manage and organize client data efficiently.
          </p>
          <p>
            <strong>Total clients in database:</strong> ${totalClients}
          </p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send(`
      <html>
        <head><title>Database Error</title></head>
        <body>
          <h1>Database Connection Failed</h1>
          <p><strong>Error:</strong> ${error.message}</p>
          <p><strong>Details:</strong> ${error.stack || 'No additional details'}</p>
        </body>
      </html>
    `);
  }
});

// ============================================
// REST API ENDPOINTS - JSON Responses
// ============================================

// GET /api/clients - Get all clients
app.get("/api/clients", async (req, res) => {
  try {
    const clients = await db.query("SELECT * FROM clients ORDER BY created_at DESC");
    res.json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch clients",
      message: error.message
    });
  }
});

// GET /api/clients/count - Get total client count (JSON)
app.get("/api/clients/count", async (req, res) => {
  try {
    const result = await db.query("SELECT COUNT(*) AS total FROM clients");
    res.json({
      success: true,
      count: result[0].total
    });
  } catch (error) {
    console.error('Error counting clients:', error);
    res.status(500).json({
      success: false,
      error: "Failed to count clients",
      message: error.message
    });
  }
});

// GET /api/clients/:id - Get single client by ID
app.get("/api/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const clients = await db.query("SELECT * FROM clients WHERE id = ?", [id]);
    
    if (clients.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Client not found",
        message: `No client found with ID: ${id}`
      });
    }
    
    res.json({
      success: true,
      data: clients[0]
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch client",
      message: error.message
    });
  }
});

// POST /api/clients - Create new client
app.post("/api/clients", async (req, res) => {
  try {
    const { full_name, email, phone, company } = req.body;
    
    // Validation
    if (!full_name || !email) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: "full_name and email are required fields"
      });
    }
    
    // Insert new client
    const result = await db.query(
      "INSERT INTO clients (full_name, email, phone, company) VALUES (?, ?, ?, ?)",
      [full_name, email, phone || null, company || null]
    );
    
    // Fetch the newly created client
    const newClient = await db.query("SELECT * FROM clients WHERE id = ?", [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: "Client created successfully",
      data: newClient[0]
    });
  } catch (error) {
    console.error('Error creating client:', error);
    
    // Handle duplicate email error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: "Duplicate email",
        message: "A client with this email already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Failed to create client",
      message: error.message
    });
  }
});

// PUT /api/clients/:id - Update existing client
app.put("/api/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, company } = req.body;
    
    // Check if client exists
    const existingClient = await db.query("SELECT * FROM clients WHERE id = ?", [id]);
    if (existingClient.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Client not found",
        message: `No client found with ID: ${id}`
      });
    }
    
    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    
    if (full_name !== undefined) {
      updates.push("full_name = ?");
      values.push(full_name);
    }
    if (email !== undefined) {
      updates.push("email = ?");
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push("phone = ?");
      values.push(phone);
    }
    if (company !== undefined) {
      updates.push("company = ?");
      values.push(company);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
        message: "Please provide at least one field to update"
      });
    }
    
    values.push(id);
    
    await db.query(
      `UPDATE clients SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
    
    // Fetch updated client
    const updatedClient = await db.query("SELECT * FROM clients WHERE id = ?", [id]);
    
    res.json({
      success: true,
      message: "Client updated successfully",
      data: updatedClient[0]
    });
  } catch (error) {
    console.error('Error updating client:', error);
    
    // Handle duplicate email error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: "Duplicate email",
        message: "A client with this email already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Failed to update client",
      message: error.message
    });
  }
});

// DELETE /api/clients/:id - Delete client
app.delete("/api/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if client exists
    const existingClient = await db.query("SELECT * FROM clients WHERE id = ?", [id]);
    if (existingClient.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Client not found",
        message: `No client found with ID: ${id}`
      });
    }
    
    // Delete the client
    await db.query("DELETE FROM clients WHERE id = ?", [id]);
    
    res.json({
      success: true,
      message: "Client deleted successfully",
      data: existingClient[0]
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      error: "Failed to delete client",
      message: error.message
    });
  }
});

// ============================================
// 404 Handler
// ============================================

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Home page: http://localhost:${PORT}/`);
  console.log(`API endpoints: http://localhost:${PORT}/api/clients`);
});