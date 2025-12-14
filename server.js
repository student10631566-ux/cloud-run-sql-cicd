const express = require("express");
const app = express();
const db = require("./db");

const PORT = process.env.PORT || 3000;

// Single GET route returning HTML + DB data
app.get("/", async (req, res) => {
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});