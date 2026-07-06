const fs = require('fs');

// Patch Home.jsx
let homeContent = fs.readFileSync('client/src/pages/Home.jsx', 'utf8');
homeContent = homeContent.replace(
  /const res = await axios\.get\('http:\/\/localhost:5000\/api\/maps'\)/g,
  `const API_URL = import.meta.env.VITE_API_URL || '';\n      const res = await axios.get(\`\${API_URL}/api/maps\`)`
);
homeContent = homeContent.replace(
  /const res = await axios\.post\('http:\/\/localhost:5000\/api\/maps', \{/g,
  `const API_URL = import.meta.env.VITE_API_URL || '';\n      const res = await axios.post(\`\${API_URL}/api/maps\`, {`
);
fs.writeFileSync('client/src/pages/Home.jsx', homeContent);

// Patch Canvas.jsx
let canvasContent = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');
canvasContent = canvasContent.replace(
  /const res = await axios\.get\(\`http:\/\/localhost:5000\/api\/maps\/\$\{id\}\`\);/g,
  `const API_URL = import.meta.env.VITE_API_URL || '';\n        const res = await axios.get(\`\${API_URL}/api/maps/\${id}\`);`
);
canvasContent = canvasContent.replace(
  /await axios\.put\(\`http:\/\/localhost:5000\/api\/maps\/\$\{id\}\`, \{/g,
  `const API_URL = import.meta.env.VITE_API_URL || '';\n      await axios.put(\`\${API_URL}/api/maps/\${id}\`, {`
);
fs.writeFileSync('client/src/pages/Canvas.jsx', canvasContent);

console.log('API URLs patched.');
