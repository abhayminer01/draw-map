const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

// 1. Remove Rotation slider from modal
content = content.replace(
  /\s*\{houseModal\.tool === 'text' && \(\s*\n\s*<div>\s*\n\s*<label className="flex items-center justify-between text-sm text-gray-400 mb-2">\s*\n\s*<span>Rotation<\/span>\s*\n\s*<span className="text-white font-medium">\{houseData\.rotation \|\| 0\}°<\/span>\s*\n\s*<\/label>\s*\n\s*<input \s*\n\s*type="range"\s*\n\s*min="0"\s*\n\s*max="360"\s*\n\s*value=\{houseData\.rotation \|\| 0\}\s*\n\s*onChange=\{\(e\) => setHouseData\(\{\.\.\.houseData, rotation: parseInt\(e\.target\.value\) \|\| 0\}\)\}\s*\n\s*className="w-full accent-primary"\s*\n\s*\/>\s*\n\s*<\/div>\s*\n\s*\)\}/,
  ""
);

// 2. Add shapeRefs and trTextRef
content = content.replace(
  /const trRef = useRef\(null\);/,
  `const trRef = useRef(null);\n  const trTextRef = useRef(null);\n  const shapeRefs = useRef({});`
);

// 3. Add useEffect to attach transformer
const attachEffect = `  useEffect(() => {
    if (selectedRoadId && trTextRef.current) {
      const selectedNode = shapeRefs.current[selectedRoadId];
      if (selectedNode) {
        trTextRef.current.nodes([selectedNode]);
        trTextRef.current.getLayer().batchDraw();
      }
    } else if (trTextRef.current) {
      trTextRef.current.nodes([]);
    }
  }, [selectedRoadId, roads]);`;
content = content.replace(
  /trRef\.current\.getLayer\(\)\.batchDraw\(\);\s*\n\s*\}\s*\n\s*\}, \[isRefEditing, refImageObj, isRefVisible\]\);/,
  `trRef.current.getLayer().batchDraw();\n    }\n  }, [isRefEditing, refImageObj, isRefVisible]);\n\n${attachEffect}`
);

// 4. Update text Group
const textGroupReplace = `<Group
                      ref={(node) => { shapeRefs.current[road.id] = node; }}
                      x={road.x} y={road.y} rotation={road.rotation || 0}
                      scaleX={road.scaleX || 1} scaleY={road.scaleY || 1}
                      draggable={effectiveTool === 'select'}
                      onClick={() => { 
                        if (effectiveTool === 'eraser') handleUpdateRoads(roads.filter(r => r.id !== road.id)); 
                        else if (effectiveTool === 'select') setSelectedRoadId(road.id);
                      }}
                      onDblClick={() => {
                        if (effectiveTool === 'select') {
                          setHouseModal({ isOpen: true, x: road.x, y: road.y, tool: road.type, editingId: road.id });
                          setHouseData({ number: road.number, isNonResidential: false, textSize: road.textSize || 12, purposeNumber: road.purposeNumber || '', isMultipleNumbers: road.isMultipleNumbers || false, endingNumber: road.endingNumber || '', rotation: road.rotation || 0 });
                        }
                      }}
                      onDragEnd={(e) => {
                        setRoads(prev => {
                          const newRoads = prev.map(r => r.id === road.id ? { ...r, x: e.target.x(), y: e.target.y() } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        setRoads(prev => {
                          const newRoads = prev.map(r => r.id === road.id ? {
                            ...r,
                            x: node.x(),
                            y: node.y(),
                            rotation: node.rotation(),
                            scaleX: node.scaleX(),
                            scaleY: node.scaleY()
                          } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                    >`;

content = content.replace(
  /<Group\s*\n\s*x=\{road\.x\} y=\{road\.y\} rotation=\{road\.rotation \|\| 0\} draggable=\{effectiveTool === 'select'\}\s*\n\s*onClick=\{\(\) => \{ if \(effectiveTool === 'eraser'\) handleUpdateRoads\(roads\.filter\(r => r\.id !== road\.id\)\); \}\}\s*\n\s*onDblClick=\{\(\) => \{\s*\n\s*if \(effectiveTool === 'select'\) \{\s*\n\s*setHouseModal\(\{ isOpen: true, x: road\.x, y: road\.y, tool: road\.type, editingId: road\.id \}\);\s*\n\s*setHouseData\(\{ number: road\.number, isNonResidential: false, textSize: road\.textSize \|\| 12, purposeNumber: road\.purposeNumber \|\| '', isMultipleNumbers: road\.isMultipleNumbers \|\| false, endingNumber: road\.endingNumber \|\| '', rotation: road\.rotation \|\| 0 \}\);\s*\n\s*\}\s*\n\s*\}\}\s*\n\s*onDragEnd=\{\(e\) => \{\s*\n\s*setRoads\(prev => \{\s*\n\s*const newRoads = prev\.map\(r => r\.id === road\.id \? \{ \.\.\.r, x: e\.target\.x\(\), y: e\.target\.y\(\) \} : r\);\s*\n\s*pushToHistory\(newRoads\);\s*\n\s*return newRoads;\s*\n\s*\}\);\s*\n\s*\}\}\s*\n\s*>/,
  textGroupReplace
);

// 5. Add Transformer to Layer
content = content.replace(
  /(\s*)<\/Layer>/,
  `$1  {selectedRoadId && roads.find(r => r.id === selectedRoadId && r.type === 'text') && (
$1    <Transformer 
$1      ref={trTextRef}
$1      boundBoxFunc={(oldBox, newBox) => {
$1        if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {
$1          return oldBox;
$1        }
$1        return newBox;
$1      }}
$1    />
$1  )}
$1</Layer>`
);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('Text transform patch complete.');
