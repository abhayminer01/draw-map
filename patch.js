const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

// 1. Initial State & Modal close logic
content = content.replace(
  /setHouseData\(\{ number: '', isNonResidential: false, textSize: 12 \}\);/g,
  `setHouseData({ number: '', isNonResidential: false, textSize: 12, purposeNumber: '', isMultipleNumbers: false, endingNumber: '' });`
);

// 2. double click handlers
content = content.replace(
  /setHouseData\(\{\s*number:\s*road\.number,\s*isNonResidential:\s*road\.isNonResidential\s*\|\|\s*false\s*\}\);/g,
  `setHouseData({ number: road.number, isNonResidential: road.isNonResidential || false, purposeNumber: road.purposeNumber || '', isMultipleNumbers: road.isMultipleNumbers || false, endingNumber: road.endingNumber || '' });`
);
content = content.replace(
  /setHouseData\(\{\s*number:\s*road\.number,\s*isNonResidential:\s*false\s*\}\);/g,
  `setHouseData({ number: road.number, isNonResidential: false, purposeNumber: road.purposeNumber || '', isMultipleNumbers: road.isMultipleNumbers || false, endingNumber: road.endingNumber || '' });`
);
content = content.replace(
  /setHouseData\(\{\s*number:\s*road\.number,\s*isNonResidential:\s*false,\s*textSize:\s*road\.textSize\s*\|\|\s*12\s*\}\);/g,
  `setHouseData({ number: road.number, isNonResidential: false, textSize: road.textSize || 12, purposeNumber: road.purposeNumber || '', isMultipleNumbers: road.isMultipleNumbers || false, endingNumber: road.endingNumber || '' });`
);

// 3. Edit building save logic
content = content.replace(
  /number: houseData\.number,\s*\n\s*isNonResidential: houseData\.isNonResidential,\s*\n\s*textSize: houseData\.textSize \|\| 12/g,
  `number: houseData.number,
                      isNonResidential: houseData.isNonResidential,
                      textSize: houseData.textSize || 12,
                      purposeNumber: houseData.purposeNumber || '',
                      isMultipleNumbers: houseData.isMultipleNumbers || false,
                      endingNumber: houseData.endingNumber || ''`
);

// 4. Text rendering replacement
const numberFormatExpr = `(road.isMultipleNumbers && road.endingNumber ? \\\`\\\${road.number} - \\\${road.endingNumber}\\\` : road.number)`;

// House
content = content.replace(
  /<Text\s*\n\s*text=\{road\.number\}\s*\n\s*x=\{-houseSize \/ 2\}\s*\n\s*y=\{-houseSize \* 0\.16\}\s*\n\s*width=\{houseSize\}\s*\n\s*align="center"\s*\n\s*fontSize=\{houseSize \* 0\.32\}\s*\n\s*fontStyle="bold"\s*\n\s*fill="#111827"\s*\n\s*\/>/g,
  `<Text
                        text={${numberFormatExpr}}
                        x={-houseSize / 2}
                        y={-houseSize * 0.16}
                        width={houseSize}
                        align="center"
                        fontSize={houseSize * 0.32}
                        fontStyle="bold"
                        fill="#111827"
                      />
                      {road.purposeNumber && (
                        <Text
                          text={road.purposeNumber}
                          x={-houseSize / 2}
                          y={houseSize * 0.55}
                          width={houseSize}
                          align="center"
                          fontSize={houseSize * 0.25}
                          fill="#4b5563"
                        />
                      )}`
);

// Bad House
content = content.replace(
  /<Text\s*\n\s*text=\{road\.number\}\s*\n\s*x=\{-houseSize \/ 2\}\s*\n\s*y=\{0\}\s*\n\s*width=\{houseSize\}\s*\n\s*align="center"\s*\n\s*fontSize=\{houseSize \* 0\.32\}\s*\n\s*fontStyle="bold"\s*\n\s*fill="#111827"\s*\n\s*\/>/g,
  `<Text
                        text={${numberFormatExpr}}
                        x={-houseSize / 2}
                        y={0}
                        width={houseSize}
                        align="center"
                        fontSize={houseSize * 0.32}
                        fontStyle="bold"
                        fill="#111827"
                      />
                      {road.purposeNumber && (
                        <Text
                          text={road.purposeNumber}
                          x={-houseSize / 2}
                          y={houseSize * 0.7}
                          width={houseSize}
                          align="center"
                          fontSize={houseSize * 0.25}
                          fill="#4b5563"
                        />
                      )}`
);

// Temple
content = content.replace(
  /<Text\s*\n\s*text=\{road\.number\}\s*\n\s*x=\{-houseSize \/ 2\}\s*\n\s*y=\{houseSize \* 0\.6\}\s*\/\/\s*Below\s*the\s*temple\s*\n\s*width=\{houseSize\}\s*\n\s*align="center"\s*\n\s*fontSize=\{houseSize \* 0\.4\}\s*\n\s*fontStyle="bold"\s*\n\s*fill="#111827"\s*\n\s*\/>/g,
  `<Text
                        text={${numberFormatExpr}}
                        x={-houseSize / 2}
                        y={houseSize * 0.6} // Below the temple
                        width={houseSize}
                        align="center"
                        fontSize={houseSize * 0.4}
                        fontStyle="bold"
                        fill="#111827"
                      />
                      {road.purposeNumber && (
                        <Text
                          text={road.purposeNumber}
                          x={-houseSize / 2}
                          y={houseSize * 1.05}
                          width={houseSize}
                          align="center"
                          fontSize={houseSize * 0.25}
                          fill="#4b5563"
                        />
                      )}`
);

// Mosque, Church, Gurudwara
content = content.replace(
  /<Text text=\{road\.number\} x=\{-houseSize \/ 2\} y=\{houseSize \* 0\.6\} width=\{houseSize\} align="center" fontSize=\{houseSize \* 0\.4\} fontStyle="bold" fill="#111827" \/>/g,
  `<Text text={${numberFormatExpr}} x={-houseSize / 2} y={houseSize * 0.6} width={houseSize} align="center" fontSize={houseSize * 0.4} fontStyle="bold" fill="#111827" />
                      {road.purposeNumber && (
                        <Text text={road.purposeNumber} x={-houseSize / 2} y={houseSize * 1.05} width={houseSize} align="center" fontSize={houseSize * 0.25} fill="#4b5563" />
                      )}`
);

// 5. Modal inputs
const modalInsert = \`                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && houseData.number.trim() !== '') {
                      document.getElementById('place-house-btn').click();
                    }
                  }}
                />
              </div>

              {/* Multiple Numbers Checkbox */}
              {houseModal.tool !== 'text' && (
                <label className="flex items-center gap-3 cursor-pointer group mt-4">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={houseData.isMultipleNumbers || false}
                      onChange={(e) => setHouseData({...houseData, isMultipleNumbers: e.target.checked})}
                      className="w-5 h-5 rounded border border-white/20 bg-[#1c1c1f] text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer appearance-none checked:bg-primary checked:border-primary"
                    />
                    {houseData.isMultipleNumbers && (
                      <svg className="w-3 h-3 text-white absolute left-1 top-1 pointer-events-none" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Multiple Numbers</span>
                </label>
              )}
              
              {houseData.isMultipleNumbers && houseModal.tool !== 'text' && (
                <div className="mt-3">
                  <label className="block text-sm text-gray-400 mb-2">Ending Number</label>
                  <input 
                    type="text" 
                    value={houseData.endingNumber || ''}
                    onChange={(e) => setHouseData({...houseData, endingNumber: e.target.value})}
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 105"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && houseData.endingNumber.trim() !== '') {
                        document.getElementById('place-house-btn').click();
                      }
                    }}
                  />
                </div>
              )}

              {/* Purpose Number Field */}
              {houseModal.tool !== 'text' && (
                <div className="mt-4">
                  <label className="block text-sm text-gray-400 mb-2">Purpose Number</label>
                  <input 
                    type="text" 
                    value={houseData.purposeNumber || ''}
                    onChange={(e) => setHouseData({...houseData, purposeNumber: e.target.value})}
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. Shop, Commercial, etc."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        document.getElementById('place-house-btn').click();
                      }
                    }}
                  />
                </div>
              )\`;

content = content.replace(
  /                  autoFocus\s*\n\s*onKeyDown=\{\(e\) => \{\s*\n\s*if \(e\.key === 'Enter' && houseData\.number\.trim\(\) !== ''\) \{\s*\n\s*document\.getElementById\('place-house-btn'\)\.click\(\);\s*\n\s*\}\s*\n\s*\}\}\s*\n\s*\/>\s*\n\s*<\/div>/g,
  modalInsert
);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('Patch complete.');
