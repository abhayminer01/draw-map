const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

content = content.replace(
  /<Text text=\{road\.number\} x=\{-houseSize \* 5\} y=\{-houseSize \* 0\.2\} width=\{houseSize \* 10\} align="center" fontSize=\{road\.textSize \|\| 12\} fontStyle="bold" listening=\{false\} fill="#111827" \/>/,
  `<Text text={road.number} x={-houseSize * 5} y={-houseSize * 0.2} width={houseSize * 10} align="center" fontSize={road.textSize || 12} fontStyle="bold" fill="#111827" />`
);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('Hit region fixed.');
