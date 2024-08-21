const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const initializeDatabase = async () => {
  try {
    // Open the SQLite database
    const db = await open({
      filename: './sqlite/sales.db',
      driver: sqlite3.Database,
    });

    // Create the Sales table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS Sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        sale_date TEXT NOT NULL
      );
    `);

    // Insert some random entries into the Sales table
    await db.exec(`
      INSERT INTO Sales (product_name, quantity, price, sale_date)
      VALUES 
        ('Product A', 10, 29.99, '2024-08-17'),
        ('Product B', 5, 49.99, '2024-08-16'),
        ('Product C', 3, 99.99, '2024-08-15'),
        ('Product D', 7, 19.99, '2024-08-14'),
        ('Product E', 2, 149.99, '2024-08-13');
    `);

    console.log('Database initialized and sample data inserted successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

initializeDatabase();
