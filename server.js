const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Single GET route returning HTML
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Client Information System</title>
      </head>
      <body>
        <h1>Client Information System</h1>
        <p>Welcome to the Client Information System. This system helps manage and organize client data efficiently.</p>
      </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
