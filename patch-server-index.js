const fs = require('fs');
let content = fs.readFileSync('server/index.js', 'utf8');

const target = `const auth = require('./middleware/auth');
const authRoutes = require('./routes/auth');

const app = express();`;

const replace = `const path = require('path');
const auth = require('./middleware/auth');
const authRoutes = require('./routes/auth');

const app = express();`;

content = content.replace(target, replace);

const envTarget = `const knex = require('knex')(knexConfig.development);`;
const envReplace = `const environment = process.env.NODE_ENV || 'development';
const knex = require('knex')(knexConfig[environment]);`;
content = content.replace(envTarget, envReplace);

const staticTarget = `const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {`;

const staticReplace = `// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {`;

content = content.replace(staticTarget, staticReplace);

fs.writeFileSync('server/index.js', content);
console.log('Server index patched.');
