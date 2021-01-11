// Libraries
const express = require('express');

// Instances
const app = express();

// Environment
const PORT = parseInt(process.argv[2] || process.env.PORT) || 3000;

// Request Handlers

// Start Server
app.listen(PORT, () => {
    console.log(`listening on port ${PORT} at ${new Date()}`);
})
