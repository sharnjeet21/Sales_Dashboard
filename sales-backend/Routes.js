const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./sqlite/sales.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the exec database.');
});

// Example route to get sales data
router.get('/api/sales-data', (req, res) => {
  const query = 'SELECT * FROM Sales';
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(rows);
    }
  });
});

// Example route to get monthly sales data
router.get('/api/monthly-sales-data', (req, res) => {
  const query = 'SELECT * FROM MonthlySales';
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(rows);
    }
  });
});

module.exports = router;
