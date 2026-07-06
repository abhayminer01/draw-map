const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

const targetRiver = `                  ) : type === 'river' ? (
                    <Group>
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
                    </Group>`;

const newRiver = `                  ) : type === 'river' ? (
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
                        strokeWidth={2}
                        dash={[15, 15, 5, 15]}
                        lineCap="round"
                        lineJoin="round"
                        tension={0.4}
                        closed={road.isClosed}
                        listening={false}
                        opacity={0.8}
                      />
                    </Group>`;

content = content.replace(targetRiver, newRiver);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('River patch complete.');
