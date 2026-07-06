const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

// 1. Add shadowsEnabled state
content = content.replace(
  /const \[boundaryColor, setBoundaryColor\] = useState\(\(\) => localStorage\.getItem\('boundaryColor'\) \|\| '#22c55e'\);/,
  `const [boundaryColor, setBoundaryColor] = useState(() => localStorage.getItem('boundaryColor') || '#22c55e');
  const [shadowsEnabled, setShadowsEnabled] = useState(() => localStorage.getItem('shadowsEnabled') !== 'false');`
);

// 2. Add Settings toggle for Shadows
const settingsInsert = `              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Enable Shadows (Disable for performance)</label>
                <button
                  onClick={() => {
                    const newVal = !shadowsEnabled;
                    setShadowsEnabled(newVal);
                    localStorage.setItem('shadowsEnabled', newVal);
                  }}
                  className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none \${shadowsEnabled ? 'bg-primary' : 'bg-gray-600'}\`}
                >
                  <span className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${shadowsEnabled ? 'translate-x-6' : 'translate-x-1'}\`} />
                </button>
              </div>`;

content = content.replace(
  /(\s*className="w-full accent-primary"\s*\/>\s*<\/div>)/g,
  (match, p1, offset, string) => {
    // Only insert after the Purpose Number Size slider which is the last slider I added.
    // Wait, the regex will match all sliders. I'll just replace the last one.
    return match; // skip for now, do a smarter replace
  }
);

// Better replace for settings:
const purposeMatch = 'localStorage.setItem(\'purposeTextScale\', val);\n                  }}\n                  className="w-full accent-primary"\n                />\n              </div>';
content = content.replace(purposeMatch, purposeMatch + '\n\n' + settingsInsert);

// 3. Add shadowEnabled={shadowsEnabled} to all shapes with shadowBlur
content = content.replace(/shadowBlur=\{10\}/g, 'shadowBlur={10} shadowEnabled={shadowsEnabled} perfectDrawEnabled={false}');
content = content.replace(/shadowBlur=\{20\}/g, 'shadowBlur={20} shadowEnabled={shadowsEnabled}'); // For background

// 4. Add listening={false} to all Text elements
// Main numbers
content = content.replace(/fontStyle="bold"/g, 'fontStyle="bold" listening={false}');
// Purpose numbers
content = content.replace(/fill="#4b5563"/g, 'fill="#4b5563" listening={false}');

// 5. Add listening={false} to decorative elements
// Flag pole
content = content.replace(/points=\{\[0, -houseSize \* 0\.3, 0, -houseSize \* 0\.8\]\}\s*\n\s*stroke="#374151"/g, 'points={[0, -houseSize * 0.3, 0, -houseSize * 0.8]}\n                        stroke="#374151"\n                        listening={false}');
// Flag
content = content.replace(/points=\{\[0, -houseSize \* 0\.8, houseSize \* 0\.4, -houseSize \* 0\.65, 0, -houseSize \* 0\.5\]\}\s*\n\s*stroke="#374151"/g, 'points={[0, -houseSize * 0.8, houseSize * 0.4, -houseSize * 0.65, 0, -houseSize * 0.5]}\n                        stroke="#374151"\n                        listening={false}');
// Temple Top Tier
content = content.replace(/x=\{-houseSize \* 0\.35\}\s*\n\s*y=\{-houseSize \* 0\.3\}/g, 'x={-houseSize * 0.35}\n                        y={-houseSize * 0.3}\n                        listening={false}');
// Cross
content = content.replace(/points=\{\[0, -houseSize \* 0\.6, 0, -houseSize\]\}\s*\n\s*stroke="#374151"/g, 'points={[0, -houseSize * 0.6, 0, -houseSize]}\n                        stroke="#374151"\n                        listening={false}');
content = content.replace(/points=\{\[-houseSize \* 0\.15, -houseSize \* 0\.85, houseSize \* 0\.15, -houseSize \* 0\.85\]\}\s*\n\s*stroke="#374151"/g, 'points={[-houseSize * 0.15, -houseSize * 0.85, houseSize * 0.15, -houseSize * 0.85]}\n                        stroke="#374151"\n                        listening={false}');


fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('Performance patch complete.');
