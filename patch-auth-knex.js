const fs = require('fs');
let content = fs.readFileSync('server/routes/auth.js', 'utf8');

const target = `const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig.development);`;

const replace = `const knexConfig = require('../knexfile');
const environment = process.env.NODE_ENV || 'development';
const knex = require('knex')(knexConfig[environment]);`;

content = content.replace(target, replace);
fs.writeFileSync('server/routes/auth.js', content);
console.log('Auth knex patched.');
