const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const router = require('./Routes.js');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/', router);

// Serve React frontend in production
const frontendDist = path.join(__dirname, '../sales-frontend/dist');
app.use(express.static(frontendDist));

// Catch-all: send index.html for any non-API route (React Router support)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
