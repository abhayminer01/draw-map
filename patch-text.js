const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

// 1. Initial State
content = content.replace(
  /setHouseData\(\{ number: '', isNonResidential: false, textSize: 12, purposeNumber: '', isMultipleNumbers: false, endingNumber: '' \}\);/g,
  `setHouseData({ number: '', isNonResidential: false, textSize: 12, purposeNumber: '', isMultipleNumbers: false, endingNumber: '', rotation: 0 });`
);

// 2. onDblClick for text
content = content.replace(
  /setHouseData\(\{ number: road\.number, isNonResidential: false, textSize: road\.textSize \|\| 12, purposeNumber: road\.purposeNumber \|\| '', isMultipleNumbers: road\.isMultipleNumbers \|\| false, endingNumber: road\.endingNumber \|\| '' \}\);/g,
  `setHouseData({ number: road.number, isNonResidential: false, textSize: road.textSize || 12, purposeNumber: road.purposeNumber || '', isMultipleNumbers: road.isMultipleNumbers || false, endingNumber: road.endingNumber || '', rotation: road.rotation || 0 });`
);

// 3. Text Group Rotation
content = content.replace(
  /\) : type === 'text' \? \(\s*\n\s*<Group\s*\n\s*x=\{road\.x\} y=\{road\.y\} draggable=\{effectiveTool === 'select'\}/,
  `) : type === 'text' ? (\n                    <Group\n                      x={road.x} y={road.y} rotation={road.rotation || 0} draggable={effectiveTool === 'select'}`
);

// 4. Modal textarea replacement
const inputReplacement = `{houseModal.tool === 'text' ? (
                  <textarea
                    value={houseData.number}
                    onChange={(e) => setHouseData({...houseData, number: e.target.value})}
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-primary transition-colors resize-none"
                    placeholder="Enter text..."
                    rows={4}
                    autoFocus
                  />
                ) : (
                  <input 
                    type="text" 
                    value={houseData.number}
                    onChange={(e) => setHouseData({...houseData, number: e.target.value})}
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 101"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && houseData.number.trim() !== '') {
                        document.getElementById('place-house-btn').click();
                      }
                    }}
                  />
                )}`;

content = content.replace(
  /<input\s*\n\s*type="text"\s*\n\s*value=\{houseData\.number\}\s*\n\s*onChange=\{\(e\) => setHouseData\(\{\.\.\.houseData, number: e\.target\.value\}\)\}\s*\n\s*className="w-full bg-\[\#1c1c1f\] border border-white\/10 rounded-lg px-3 py-2\.5 text-white focus:outline-none focus:border-primary transition-colors"\s*\n\s*placeholder="e\.g\. 101"\s*\n\s*autoFocus\s*\n\s*onKeyDown=\{\(e\) => \{\s*\n\s*if \(e\.key === 'Enter' && houseData\.number\.trim\(\) !== ''\) \{\s*\n\s*document\.getElementById\('place-house-btn'\)\.click\(\);\s*\n\s*\}\s*\n\s*\}\}\s*\n\s*\/>/,
  inputReplacement
);

// 5. Add Rotation slider
const rotReplacement = `{houseModal.tool === 'text' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Text Size</label>
                  <input 
                    type="number"
                    min="1"
                    max="500"
                    value={houseData.textSize || 12}
                    onChange={(e) => setHouseData({...houseData, textSize: parseInt(e.target.value) || 12})}
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              )}
              
              {houseModal.tool === 'text' && (
                <div>
                  <label className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>Rotation</span>
                    <span className="text-white font-medium">{houseData.rotation || 0}°</span>
                  </label>
                  <input 
                    type="range"
                    min="0"
                    max="360"
                    value={houseData.rotation || 0}
                    onChange={(e) => setHouseData({...houseData, rotation: parseInt(e.target.value) || 0})}
                    className="w-full accent-primary"
                  />
                </div>
              )}`;

content = content.replace(
  /\{houseModal\.tool === 'text' && \(\s*\n\s*<div>\s*\n\s*<label className="block text-sm text-gray-400 mb-2">Text Size<\/label>\s*\n\s*<input\s*\n\s*type="number"\s*\n\s*min="1"\s*\n\s*max="500"\s*\n\s*value=\{houseData\.textSize \|\| 12\}\s*\n\s*onChange=\{\(e\) => setHouseData\(\{\.\.\.houseData, textSize: parseInt\(e\.target\.value\) \|\| 12\}\)\}\s*\n\s*className="w-full bg-\[\#1c1c1f\] border border-white\/10 rounded-lg px-3 py-2\.5 text-white focus:outline-none focus:border-primary transition-colors"\s*\n\s*\/>\s*\n\s*<\/div>\s*\n\s*\)\}/,
  rotReplacement
);

// 6. Save rotation in place-house-btn
content = content.replace(
  /endingNumber: houseData\.endingNumber \|\| ''\s*\n\s*\} : r\);/g,
  `endingNumber: houseData.endingNumber || '',
                      rotation: houseData.rotation || 0
                    } : r);`
);
content = content.replace(
  /endingNumber: houseData\.endingNumber \|\| ''\s*\n\s*\};\s*\n\s*handleUpdateRoads\(\[\.\.\.roads, newElement\]\);/g,
  `endingNumber: houseData.endingNumber || '',
                      rotation: houseData.rotation || 0
                    };
                    handleUpdateRoads([...roads, newElement]);`
);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('Text patch complete.');
