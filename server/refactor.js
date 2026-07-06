const fs = require('fs');
const file = 'c:/Users/ABHAY/Documents/CODING AREA/Draw Map/client/src/pages/Canvas.jsx';
let code = fs.readFileSync(file, 'utf8');

const startMarker = '{/* Roads and Boundaries */}';
const endMarker = '{/* Pending Road (First Click) */}';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found');
  process.exit(1);
}

let before = code.substring(0, startIndex + startMarker.length);
let after = code.substring(startIndex + startMarker.length);

const roadLayersCode = `
              {/* 1. Road Outer Borders */}
              {roads.filter(r => r.type === 'road' || r.type === 'bad_road').map((road) => (
                <Group key={'border_' + road.id}>
                  <Line
                    points={road.points}
                    stroke="#333"
                    strokeWidth={20}
                    lineCap="round"
                    lineJoin="round"
                    tension={0.4}
                    closed={road.isClosed}
                    dash={road.type === 'bad_road' ? [20, 20] : undefined}
                    fillEnabled={false}
                    onClick={() => {
                      if (effectiveTool === 'select') setSelectedRoadId(road.id);
                      else if (effectiveTool === 'eraser') {
                        handleUpdateRoads(roads.filter(r => r.id !== road.id));
                        if (selectedRoadId === road.id) setSelectedRoadId(null);
                      }
                    }}
                    hitStrokeWidth={40}
                  />
                </Group>
              ))}
              {/* 2. Road Inner Fills */}
              {roads.filter(r => r.type === 'road' || r.type === 'bad_road').map((road) => (
                <Group key={'fill_' + road.id}>
                  <Line
                    points={road.points}
                    stroke="#f4f4f5"
                    strokeWidth={16}
                    lineCap="round"
                    lineJoin="round"
                    tension={0.4}
                    closed={road.isClosed}
                    listening={false}
                  />
                </Group>
              ))}
              {/* 3. Road Dashed Lines */}
              {roads.filter(r => r.type === 'road' || r.type === 'bad_road').map((road) => (
                <Group key={'dash_' + road.id}>
                  <Line
                    points={road.points}
                    stroke="#ccc"
                    strokeWidth={2}
                    dash={[10, 10]}
                    tension={0.4}
                    closed={road.isClosed}
                    listening={false}
                  />
                </Group>
              ))}
`;

after = after.replace(
  /{type === 'road' \|\| type === 'bad_road' \? \([\s\S]*?\) : type === 'boundary' \|\| !type \? \(/,
  "{type === 'road' || type === 'bad_road' ? null : type === 'boundary' || !type ? ("
);

fs.writeFileSync(file, before + '\n' + roadLayersCode + after);
console.log('Success');
