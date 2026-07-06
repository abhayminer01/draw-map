const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDb() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD
    });

    console.log('Connected to MySQL server.');
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DATABASE_NAME}\`;`);
    console.log(`Database ${process.env.DATABASE_NAME} created or already exists.`);
    
    await connection.end();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initDb();
