const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

// 1. Add getTaperPoints helper outside the component
const helperStr = `const getTaperPoints = (pA, pB, width, length) => {
  const dx = pA.x - pB.x;
  const dy = pA.y - pB.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return [];
  const vx = dx / dist;
  const vy = dy / dist;
  
  const nx = -vy;
  const ny = vx;
  
  const pLeft = { x: pA.x + nx * (width / 2), y: pA.y + ny * (width / 2) };
  const pRight = { x: pA.x - nx * (width / 2), y: pA.y - ny * (width / 2) };
  const pTip = { x: pA.x + vx * length, y: pA.y + vy * length };
  
  return [pLeft.x, pLeft.y, pTip.x, pTip.y, pRight.x, pRight.y];
};

export default function Canvas() {`;

content = content.replace(/export default function Canvas\(\) \{/, helperStr);

// 2. Modify River rendering
const targetRiver = `                  ) : type === 'river' ? (
                    <Group>
                      {/* Base River */}
                      <Line
                        points={road.points}
                        stroke="#0ea5e9"
                        strokeWidth={16}
                        lineCap="square"
                        lineJoin="round"
                        tension={0.4}
                        closed={road.isClosed}
                        fillEnabled={false}
                        onClick={() => {
                          if (effectiveTool === 'select') setSelectedRoadId(road.id);
                          else if (effectiveTool === 'eraser') handleUpdateRoads(roads.filter(r => r.id !== road.id));
                        }}
                        hitStrokeWidth={30}
                      />
                      {/* Water Flow Ripple Lines */}
                      <Line
                        points={road.points}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                        dash={[5, 20, 10, 10]}
                        lineCap="round"
                        lineJoin="round"
                        tension={0.4}
                        closed={road.isClosed}
                        listening={false}
                        opacity={0.6}
                        x={-4}
                        y={-4}
                      />
                      <Line
                        points={road.points}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                        dash={[15, 15, 5, 15]}
                        lineCap="round"
                        lineJoin="round"
                        tension={0.4}
                        closed={road.isClosed}
                        listening={false}
                        opacity={0.8}
                      />
                      <Line
                        points={road.points}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                        dash={[10, 15, 20, 5]}
                        lineCap="round"
                        lineJoin="round"
                        tension={0.4}
                        closed={road.isClosed}
                        listening={false}
                        opacity={0.6}
                        x={4}
                        y={4}
                      />
                    </Group>`;

const newRiver = `                  ) : type === 'river' ? (
                    <Group>
                      {/* Base River */}
                      <Line
                        points={road.points}
                        stroke="#0ea5e9"
                        strokeWidth={16}
                        lineCap="butt"
                        lineJoin="round"
                        tension={0.4}
                        closed={road.isClosed}
                        fillEnabled={false}
                        onClick={() => {
                          if (effectiveTool === 'select') setSelectedRoadId(road.id);
                          else if (effectiveTool === 'eraser') handleUpdateRoads(roads.filter(r => r.id !== road.id));
                        }}
                        hitStrokeWidth={30}
                      />
                      
                      {/* Vein Tapers */}
                      {road.points.length >= 4 && !road.isClosed && (
                        <>
                          <Line
                            points={getTaperPoints({x: road.points[0], y: road.points[1]}, {x: road.points[2], y: road.points[3]}, 16, 25)}
                            fill="#0ea5e9"
                            closed
                            listening={false}
                          />
                          <Line
                            points={getTaperPoints({x: road.points[road.points.length-2], y: road.points[road.points.length-1]}, {x: road.points[road.points.length-4], y: road.points[road.points.length-3]}, 16, 25)}
                            fill="#0ea5e9"
                            closed
                            listening={false}
                          />
                        </>
                      )}

                      {/* Water Flow Ripple Lines */}
                      <Line
                        points={road.points}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                        dash={[5, 20, 10, 10]}
                        lineCap="round"
                        lineJoin="round"
                        tension={0.4}
                        closed={road.isClosed}
                        listening={false}
                        opacity={0.6}
                        x={-4}
                        y={-4}
                      />
                      <Line
                        points={road.points}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                        dash={[15, 15, 5, 15]}
                        lineCap="round"
                        lineJoin="round"
                        tension={0.4}
                        closed={road.isClosed}
                        listening={false}
                        opacity={0.8}
                      />
                      <Line
                        points={road.points}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                        dash={[10, 15, 20, 5]}
                        lineCap="round"
                        lineJoin="round"
                        tension={0.4}
                        closed={road.isClosed}
                        listening={false}
                        opacity={0.6}
                        x={4}
                        y={4}
                      />
                    </Group>`;

content = content.replace(targetRiver, newRiver);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('River vein patch complete.');
