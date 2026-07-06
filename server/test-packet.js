const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD
    });

    await connection.query('SET GLOBAL max_allowed_packet = 67108864'); // 64MB
    console.log('Successfully increased max_allowed_packet!');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
}

test();
