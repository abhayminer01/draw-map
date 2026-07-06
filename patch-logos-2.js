const fs = require('fs');

// Patch Login.jsx
let loginContent = fs.readFileSync('client/src/pages/Login.jsx', 'utf8');
loginContent = loginContent.replace(
  /<div className="w-16 h-16 bg-white\/5 rounded-2xl flex items-center justify-center border border-white\/10 shadow-lg">[\s\S]*?<MapIcon className="text-primary" size=\{32\} \/>[\s\S]*?<\/div>/,
  `<div className="flex items-center justify-center">
              <img src="/images/logo-without-bg.png" alt="Draw Map Logo" className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
            </div>`
);
fs.writeFileSync('client/src/pages/Login.jsx', loginContent);

// Patch Home.jsx empty state
let homeContent = fs.readFileSync('client/src/pages/Home.jsx', 'utf8');
homeContent = homeContent.replace(
  /<MapIcon className="text-gray-500" size=\{32\} \/>/,
  `<img src="/images/icon.png" alt="Draw Map" className="w-16 h-16 opacity-30 mx-auto" />`
);
fs.writeFileSync('client/src/pages/Home.jsx', homeContent);
console.log('Logos patched completely.');
