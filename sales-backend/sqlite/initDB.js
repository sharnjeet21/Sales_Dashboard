const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const initializeDatabase = async () => {
  try {
    const db = await open({
      filename: './sqlite/sales.db',
      driver: sqlite3.Database,
    });

    // Only drop and re-seed if tables are empty (safe for production restarts)
    const existing = await db.get(`SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='Sales'`);
    if (existing && existing.count > 0) {
      const rows = await db.get(`SELECT COUNT(*) as count FROM Sales`);
      if (rows && rows.count > 0) {
        console.log('Database already initialized, skipping seed.');
        await db.close();
        return;
      }
    }

    await db.exec(`DROP TABLE IF EXISTS Sales;`);
    await db.exec(`DROP TABLE IF EXISTS MonthlySales;`);

    // Sales table — richer schema
    await db.exec(`
      CREATE TABLE IF NOT EXISTS Sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ProductName TEXT NOT NULL,
        Category TEXT NOT NULL,
        Quantity INTEGER NOT NULL,
        Price REAL NOT NULL,
        TotalSales REAL NOT NULL,
        SaleDate TEXT NOT NULL,
        Region TEXT NOT NULL
      );
    `);

    // MonthlySales table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS MonthlySales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ProductName TEXT NOT NULL,
        Month TEXT NOT NULL,
        QuantitiesSold INTEGER NOT NULL,
        Revenue REAL NOT NULL
      );
    `);

    // Seed Sales data
    await db.exec(`
      INSERT INTO Sales (ProductName, Category, Quantity, Price, TotalSales, SaleDate, Region) VALUES
        ('Laptop Pro',       'Electronics',  12, 1299.99, 15599.88, '2024-01-05', 'North'),
        ('Wireless Mouse',   'Accessories',  45,   29.99,  1349.55, '2024-01-08', 'South'),
        ('USB-C Hub',        'Accessories',  30,   49.99,  1499.70, '2024-01-12', 'East'),
        ('Monitor 27"',      'Electronics',   8,  399.99,  3199.92, '2024-01-15', 'West'),
        ('Mechanical Keyboard','Accessories',20,   89.99,  1799.80, '2024-01-20', 'North'),
        ('Smartphone X',     'Electronics',  25,  899.99, 22499.75, '2024-02-03', 'South'),
        ('Tablet S',         'Electronics',  15,  499.99,  7499.85, '2024-02-07', 'East'),
        ('Headphones Pro',   'Audio',        18,  199.99,  3599.82, '2024-02-11', 'West'),
        ('Webcam HD',        'Accessories',  22,   79.99,  1759.78, '2024-02-14', 'North'),
        ('Desk Lamp LED',    'Office',       35,   34.99,  1224.65, '2024-02-18', 'South'),
        ('Standing Desk',    'Office',        5,  599.99,  2999.95, '2024-03-02', 'East'),
        ('Ergonomic Chair',  'Office',        7,  449.99,  3149.93, '2024-03-06', 'West'),
        ('Noise Cancelling Headphones','Audio',14,249.99, 3499.86, '2024-03-10', 'North'),
        ('Smart Watch',      'Electronics',  20,  349.99,  6999.80, '2024-03-15', 'South'),
        ('Portable SSD 1TB', 'Storage',      28,  109.99,  3079.72, '2024-03-20', 'East'),
        ('Gaming Mouse',     'Accessories',  33,   59.99,  1979.67, '2024-04-04', 'West'),
        ('4K Webcam',        'Accessories',  16,  129.99,  2079.84, '2024-04-09', 'North'),
        ('Bluetooth Speaker','Audio',        24,   89.99,  2159.76, '2024-04-13', 'South'),
        ('NVMe SSD 2TB',     'Storage',      19,  179.99,  3419.81, '2024-04-17', 'East'),
        ('Laptop Stand',     'Accessories',  40,   39.99,  1599.60, '2024-04-22', 'West'),
        ('iPad Pro',         'Electronics',  11,  799.99,  8799.89, '2024-05-03', 'North'),
        ('AirPods Max',      'Audio',        10,  549.99,  5499.90, '2024-05-08', 'South'),
        ('External HDD 4TB', 'Storage',      17,   89.99,  1529.83, '2024-05-12', 'East'),
        ('Monitor 32" 4K',   'Electronics',   6,  699.99,  4199.94, '2024-05-16', 'West'),
        ('Cable Management Kit','Office',    50,   19.99,   999.50, '2024-05-21', 'North');
    `);

    // Seed MonthlySales data
    await db.exec(`
      INSERT INTO MonthlySales (ProductName, Month, QuantitiesSold, Revenue) VALUES
        ('Laptop Pro',     'Jan', 12, 15599.88),
        ('Laptop Pro',     'Feb',  9, 11699.91),
        ('Laptop Pro',     'Mar', 14, 18199.86),
        ('Laptop Pro',     'Apr',  7,  9099.93),
        ('Laptop Pro',     'May', 11, 14299.89),
        ('Smartphone X',   'Jan', 18, 16199.82),
        ('Smartphone X',   'Feb', 25, 22499.75),
        ('Smartphone X',   'Mar', 20, 17999.80),
        ('Smartphone X',   'Apr', 30, 26999.70),
        ('Smartphone X',   'May', 22, 19799.78),
        ('Headphones Pro', 'Jan', 10,  1999.90),
        ('Headphones Pro', 'Feb', 18,  3599.82),
        ('Headphones Pro', 'Mar', 15,  2999.85),
        ('Headphones Pro', 'Apr', 20,  3999.80),
        ('Headphones Pro', 'May', 12,  2399.88),
        ('Tablet S',       'Jan',  8,  3999.92),
        ('Tablet S',       'Feb', 15,  7499.85),
        ('Tablet S',       'Mar', 11,  5499.89),
        ('Tablet S',       'Apr', 18,  8999.82),
        ('Tablet S',       'May', 13,  6499.87),
        ('Smart Watch',    'Jan', 15,  5249.85),
        ('Smart Watch',    'Feb', 18,  6299.82),
        ('Smart Watch',    'Mar', 20,  6999.80),
        ('Smart Watch',    'Apr', 25,  8749.75),
        ('Smart Watch',    'May', 22,  7699.78);
    `);

    console.log('Database initialized and sample data inserted successfully.');
    await db.close();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDatabase();
