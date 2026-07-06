const fs = require('fs');

// Patch Home.jsx
let homeContent = fs.readFileSync('client/src/pages/Home.jsx', 'utf8');
homeContent = homeContent.replace(
  /<MapIcon className="text-primary" size=\{24\} \/>/,
  `<img src="/images/logo-without-bg.png" alt="Draw Map Logo" className="h-8 w-auto object-contain" />`
);
homeContent = homeContent.replace(
  /<MapIcon size=\{20\} \/>/,
  `<img src="/images/logo-without-bg.png" alt="Draw Map Logo" className="h-6 w-auto object-contain" opacity-80" />`
);
fs.writeFileSync('client/src/pages/Home.jsx', homeContent);

// Patch Login.jsx
let loginContent = fs.readFileSync('client/src/pages/Login.jsx', 'utf8');
loginContent = loginContent.replace(
  /<div className="p-4 bg-primary\/10 rounded-full inline-flex">[\s\S]*?<MapIcon className="text-primary" size=\{32\} \/>[\s\S]*?<\/div>/,
  `<img src="/images/logo-without-bg.png" alt="Draw Map Logo" className="h-16 w-auto object-contain mx-auto drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" />`
);
fs.writeFileSync('client/src/pages/Login.jsx', loginContent);

// Patch MapCard.jsx
let mapCardContent = fs.readFileSync('client/src/components/MapCard.jsx', 'utf8');
mapCardContent = mapCardContent.replace(
  /<MapIcon size=\{28\} strokeWidth=\{1\.5\} \/>/,
  `<img src="/images/icon.png" alt="Map Icon" className="w-10 h-10 opacity-30 group-hover:opacity-50 transition-opacity duration-300" />`
);
fs.writeFileSync('client/src/components/MapCard.jsx', mapCardContent);

console.log('Logos replaced successfully.');
