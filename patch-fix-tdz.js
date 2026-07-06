const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

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

// Remove from the old location
content = content.replace(attachEffect, '');

// Add to the new location
const targetStr = `  const effectiveTool = isSpaceDown ? 'pan' : activeTool;`;
content = content.replace(
  targetStr,
  `${targetStr}\n\n${attachEffect}`
);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('TDZ patch complete.');
