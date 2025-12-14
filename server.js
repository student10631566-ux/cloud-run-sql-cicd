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
    console.error(error);
    res.status(500).send("Database connection failed");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});