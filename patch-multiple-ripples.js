const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

const targetRiver = `                      {/* Water Flow Ripple Lines */}
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
                      />`;

const newRiver = `                      {/* Water Flow Ripple Lines */}
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
                      />`;

content = content.replace(targetRiver, newRiver);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('Multiple ripples patch complete.');
