const fs = require('fs');
let content = fs.readFileSync('server/knexfile.js', 'utf8');

const target = `  development: {`;
const replace = `  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME
    },
    migrations: {
      directory: './db/migrations'
    }
  },
  development: {`;

content = content.replace(target, replace);
fs.writeFileSync('server/knexfile.js', content);
console.log('knexfile patched.');
