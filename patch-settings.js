const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

// 1. Add states
content = content.replace(
  /const \[houseSize, setHouseSize\] = useState\(\(\) => parseInt\(localStorage\.getItem\('houseSize'\)\) \|\| 50\);/,
  `const [houseSize, setHouseSize] = useState(() => parseInt(localStorage.getItem('houseSize')) || 50);
  const [houseTextScale, setHouseTextScale] = useState(() => parseInt(localStorage.getItem('houseTextScale')) || 32);
  const [purposeTextScale, setPurposeTextScale] = useState(() => parseInt(localStorage.getItem('purposeTextScale')) || 32);`
);

// 2. Add Settings sliders
const settingsInsert = `              <div>
                <label className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>House Number Size</span>
                  <span className="text-white font-medium">{houseTextScale}%</span>
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={houseTextScale}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setHouseTextScale(val);
                    localStorage.setItem('houseTextScale', val);
                  }}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>Purpose Number Size</span>
                  <span className="text-white font-medium">{purposeTextScale}%</span>
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={purposeTextScale}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setPurposeTextScale(val);
                    localStorage.setItem('purposeTextScale', val);
                  }}
                  className="w-full accent-primary"
                />
              </div>`;

content = content.replace(
  /(\s*className="w-full accent-primary"\s*\/>\s*<\/div>)/,
  `$1\n\n${settingsInsert}`
);

// 3. Replace main number font sizes (which have fontStyle="bold")
content = content.replace(
  /fontSize=\{houseSize \* 0\.32\}\s*\n\s*fontStyle="bold"/g,
  `fontSize={houseSize * (houseTextScale / 100)}
                        fontStyle="bold"`
);
content = content.replace(
  /fontSize=\{houseSize \* 0\.4\}\s*\n\s*fontStyle="bold"/g,
  `fontSize={houseSize * (houseTextScale / 100)}
                        fontStyle="bold"`
);
content = content.replace(
  /fontSize=\{houseSize \* 0\.4\} fontStyle="bold"/g,
  `fontSize={houseSize * (houseTextScale / 100)} fontStyle="bold"`
);

// 4. Replace purpose number font sizes (which have fill="#4b5563")
content = content.replace(
  /fontSize=\{houseSize \* 0\.32\}\s*\n\s*fill="#4b5563"/g,
  `fontSize={houseSize * (purposeTextScale / 100)}
                          fill="#4b5563"`
);
content = content.replace(
  /fontSize=\{houseSize \* 0\.4\}\s*\n\s*fill="#4b5563"/g,
  `fontSize={houseSize * (purposeTextScale / 100)}
                          fill="#4b5563"`
);
content = content.replace(
  /fontSize=\{houseSize \* 0\.4\} fill="#4b5563"/g,
  `fontSize={houseSize * (purposeTextScale / 100)} fill="#4b5563"`
);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('Patch complete.');
