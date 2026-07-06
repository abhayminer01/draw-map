const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

// 1. Add hatchPattern state
content = content.replace(
  /const \[waterPattern, setWaterPattern\] = useState\(null\);/,
  `const [waterPattern, setWaterPattern] = useState(null);
  const [hatchPattern, setHatchPattern] = useState(null);`
);

// 2. Add hatchPattern generation inside the waterPattern useEffect or a new one.
const hatchEffect = `
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#d1d5db';
    ctx.fillRect(0, 0, 10, 10);
    
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(10, 0);
    // Draw corners to tile seamlessly
    ctx.moveTo(-2, 2);
    ctx.lineTo(2, -2);
    ctx.moveTo(8, 12);
    ctx.lineTo(12, 8);
    ctx.stroke();

    const img = new window.Image();
    img.src = canvas.toDataURL();
    img.onload = () => {
      setHatchPattern(img);
    };
  }, []);
`;
content = content.replace(
  /setWaterPattern\(img\);\s*\n\s*\};\s*\n\s*\}, \[\]\);/,
  `setWaterPattern(img);\n    };\n  }, []);\n${hatchEffect}`
);

// 3. Update House Rect
content = content.replace(
  /<Rect\s*\n\s*x=\{-houseSize \/ 2\}\s*\n\s*y=\{-houseSize \/ 2\}\s*\n\s*width=\{houseSize\}\s*\n\s*height=\{houseSize\}\s*\n\s*fill=\{road\.isNonResidential \? "#d1d5db" : "#ffffff"\}\s*\n\s*stroke=\{road\.isNonResidential \? "#4b5563" : "#374151"\}/,
  `<Rect
                        x={-houseSize / 2}
                        y={-houseSize / 2}
                        width={houseSize}
                        height={houseSize}
                        fill={road.isNonResidential ? (hatchPattern ? undefined : "#d1d5db") : "#ffffff"}
                        fillPatternImage={road.isNonResidential ? hatchPattern : null}
                        fillPatternRepeat="repeat"
                        stroke={road.isNonResidential ? "#4b5563" : "#374151"}`
);

// 4. Remove House Cross
content = content.replace(
  /\{road\.isNonResidential && \(\s*\n\s*<Line\s*\n\s*points=\{\[-houseSize\/2, -houseSize\/2, houseSize\/2, houseSize\/2, 0, 0, houseSize\/2, -houseSize\/2, -houseSize\/2, houseSize\/2\]\}\s*\n\s*stroke="#9ca3af"\s*\n\s*strokeWidth=\{2\}\s*\n\s*\/>\s*\n\s*\)\}/,
  ``
);

// 5. Update Bad House Polygon
content = content.replace(
  /<RegularPolygon\s*\n\s*sides=\{3\}\s*\n\s*radius=\{houseSize \/ 1\.5\}\s*\n\s*fill=\{road\.isNonResidential \? "#d1d5db" : "#ffffff"\}\s*\n\s*stroke=\{road\.isNonResidential \? "#4b5563" : "#374151"\}/,
  `<RegularPolygon
                        sides={3}
                        radius={houseSize / 1.5}
                        fill={road.isNonResidential ? (hatchPattern ? undefined : "#d1d5db") : "#ffffff"}
                        fillPatternImage={road.isNonResidential ? hatchPattern : null}
                        fillPatternRepeat="repeat"
                        stroke={road.isNonResidential ? "#4b5563" : "#374151"}`
);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('Hatch patch complete.');
