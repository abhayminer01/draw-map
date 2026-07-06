const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

content = content.replace(
  /Factory \} from 'lucide-react';/,
  `Factory, Menu } from 'lucide-react';`
);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('Fixed Menu import.');
