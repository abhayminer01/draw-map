const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

const targetStr = `                      {/* Base River */}
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
                      )}`;

const replaceStr = `                      {/* Base River */}
                      <Line
                        points={road.points}
                        stroke="#0ea5e9"
                        strokeWidth={16}
                        lineCap="round"
                        lineJoin="round"
                        tension={0.4}
                        closed={road.isClosed}
                        fillEnabled={false}
                        onClick={() => {
                          if (effectiveTool === 'select') setSelectedRoadId(road.id);
                          else if (effectiveTool === 'eraser') handleUpdateRoads(roads.filter(r => r.id !== road.id));
                        }}
                        hitStrokeWidth={30}
                      />`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('River revert patch complete.');
