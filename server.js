const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Single GET route returning plain text
app.get('/', (req, res) => {
  res.send('App running');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
