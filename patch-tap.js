const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

const oldPipeRender = `                    >
                      <Rect x={-houseSize * 0.15} y={-houseSize * 0.3} width={houseSize * 0.3} height={houseSize * 0.6} fill="#94a3b8" stroke="#334155" strokeWidth={Math.max(1, houseSize * 0.04)} cornerRadius={houseSize * 0.05} />
                      <Line points={[-houseSize * 0.15, -houseSize * 0.1, houseSize * 0.15, -houseSize * 0.1]} stroke="#334155" strokeWidth={Math.max(1, houseSize * 0.03)} listening={false} />
                      <Line points={[-houseSize * 0.15, houseSize * 0.1, houseSize * 0.15, houseSize * 0.1]} stroke="#334155" strokeWidth={Math.max(1, houseSize * 0.03)} listening={false} />
                    </Group>`;

const newPipeRender = `                    >
                      {/* Vertical Pipe */}
                      <Rect x={-houseSize * 0.05} y={-houseSize * 0.1} width={houseSize * 0.1} height={houseSize * 0.3} fill="#94a3b8" stroke="#334155" strokeWidth={Math.max(1, houseSize * 0.03)} />
                      {/* Horizontal Pipe */}
                      <Rect x={-houseSize * 0.05} y={-houseSize * 0.1} width={houseSize * 0.25} height={houseSize * 0.1} fill="#94a3b8" stroke="#334155" strokeWidth={Math.max(1, houseSize * 0.03)} />
                      {/* Nozzle */}
                      <Rect x={houseSize * 0.1} y={0} width={houseSize * 0.1} height={houseSize * 0.1} fill="#94a3b8" stroke="#334155" strokeWidth={Math.max(1, houseSize * 0.03)} />
                      {/* Handle Stem */}
                      <Line points={[0, -houseSize * 0.15, 0, -houseSize * 0.1]} stroke="#334155" strokeWidth={Math.max(2, houseSize * 0.04)} />
                      {/* Handle Top */}
                      <Line points={[-houseSize * 0.05, -houseSize * 0.15, houseSize * 0.05, -houseSize * 0.15]} stroke="#334155" strokeWidth={Math.max(2, houseSize * 0.04)} lineCap="round" />
                      {/* Water Drop */}
                      <Circle x={houseSize * 0.15} y={houseSize * 0.18} radius={houseSize * 0.03} fill="#0ea5e9" />
                    </Group>`;

content = content.replace(oldPipeRender, newPipeRender);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('Tap patch complete.');
