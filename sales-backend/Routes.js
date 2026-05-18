const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'sqlite', 'sales.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('DB connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Helper to run queries as promises
const queryAll = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

// GET /api/sales-data — all sales, optional filters: category, region, startDate, endDate
router.get('/api/sales-data', async (req, res) => {
  try {
    const { category, region, startDate, endDate } = req.query;
    let query = 'SELECT * FROM Sales WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND Category = ?';
      params.push(category);
    }
    if (region) {
      query += ' AND Region = ?';
      params.push(region);
    }
    if (startDate) {
      query += ' AND SaleDate >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND SaleDate <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY SaleDate DESC';
    const rows = await queryAll(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
});

// GET /api/monthly-sales-data — monthly breakdown
router.get('/api/monthly-sales-data', async (req, res) => {
  try {
    const rows = await queryAll('SELECT * FROM MonthlySales ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch monthly sales data' });
  }
});

// GET /api/summary — KPI summary stats
router.get('/api/summary', async (req, res) => {
  try {
    const [totals] = await queryAll(`
      SELECT
        COUNT(*) AS totalTransactions,
        SUM(TotalSales) AS totalRevenue,
        SUM(Quantity) AS totalUnitsSold,
        ROUND(AVG(TotalSales), 2) AS avgOrderValue
      FROM Sales
    `);

    const topProduct = await queryAll(`
      SELECT ProductName, SUM(TotalSales) AS revenue
      FROM Sales
      GROUP BY ProductName
      ORDER BY revenue DESC
      LIMIT 1
    `);

    const categoryBreakdown = await queryAll(`
      SELECT Category, SUM(TotalSales) AS revenue, SUM(Quantity) AS units
      FROM Sales
      GROUP BY Category
      ORDER BY revenue DESC
    `);

    const regionBreakdown = await queryAll(`
      SELECT Region, SUM(TotalSales) AS revenue
      FROM Sales
      GROUP BY Region
      ORDER BY revenue DESC
    `);

    res.json({
      ...totals,
      topProduct: topProduct[0] || null,
      categoryBreakdown,
      regionBreakdown,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch summary data' });
  }
});

// GET /api/top-products?limit=5 — top selling products by revenue
router.get('/api/top-products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const rows = await queryAll(`
      SELECT ProductName, Category, SUM(Quantity) AS totalUnits, SUM(TotalSales) AS totalRevenue
      FROM Sales
      GROUP BY ProductName, Category
      ORDER BY totalRevenue DESC
      LIMIT ?
    `, [limit]);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

// GET /api/categories — distinct categories
router.get('/api/categories', async (req, res) => {
  try {
    const rows = await queryAll('SELECT DISTINCT Category FROM Sales ORDER BY Category');
    res.json(rows.map(r => r.Category));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/regions — distinct regions
router.get('/api/regions', async (req, res) => {
  try {
    const rows = await queryAll('SELECT DISTINCT Region FROM Sales ORDER BY Region');
    res.json(rows.map(r => r.Region));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

module.exports = router;
