const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

content = content.replace(/Pipette/g, 'ShowerHead');

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('Pipe icon changed to ShowerHead.');
