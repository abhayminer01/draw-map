const fs = require('fs');
let content = fs.readFileSync('server/routes/auth.js', 'utf8');

const target = `    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }`;

const replace = `    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }`;

content = content.replace(target, replace);
fs.writeFileSync('server/routes/auth.js', content);
console.log('Auth route patch complete.');
