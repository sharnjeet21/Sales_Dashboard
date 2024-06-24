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
   
    `);

    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

initializeDatabase();
