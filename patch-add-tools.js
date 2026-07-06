const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

// 1. Lucide Imports
content = content.replace(
  /\} from 'lucide-react';/,
  `, Waves, Equal, Target, Cylinder, Droplet } from 'lucide-react';`
);

// 2. Add Toolbar buttons
const textBtnIdx = content.indexOf(`title="Add Text"`);
if (textBtnIdx > -1) {
  const btnEnd = content.indexOf(`</button>`, textBtnIdx) + 9;
  const toolbarTarget = content.substring(content.lastIndexOf(`<button`, textBtnIdx), btnEnd);
  
  const newButtons = `          <button 
            onClick={() => { setActiveTool('river'); setSelectedRoadId(null); setPendingRoad(null); }}
            className={\`p-3 rounded-xl transition-all \${activeTool === 'river' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}\`}
            title="Draw River"
          >
            <Waves size={20} />
          </button>
          <button 
            onClick={() => { setActiveTool('canal'); setSelectedRoadId(null); setPendingRoad(null); }}
            className={\`p-3 rounded-xl transition-all \${activeTool === 'canal' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}\`}
            title="Draw Canal"
          >
            <Equal size={20} />
          </button>
          <button 
            onClick={() => { setActiveTool('well'); setSelectedRoadId(null); setPendingRoad(null); }}
            className={\`p-3 rounded-xl transition-all \${activeTool === 'well' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}\`}
            title="Place Well"
          >
            <Target size={20} />
          </button>
          <button 
            onClick={() => { setActiveTool('pipe'); setSelectedRoadId(null); setPendingRoad(null); }}
            className={\`p-3 rounded-xl transition-all \${activeTool === 'pipe' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}\`}
            title="Place Pipe"
          >
            <Cylinder size={20} />
          </button>
          <button 
            onClick={() => { setActiveTool('hand_pump'); setSelectedRoadId(null); setPendingRoad(null); }}
            className={\`p-3 rounded-xl transition-all \${activeTool === 'hand_pump' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}\`}
            title="Place Hand Pump"
          >
            <Droplet size={20} />
          </button>`;

  content = content.substring(0, btnEnd) + '\n' + newButtons + content.substring(btnEnd);
}

// 3. Stage Click Handlers
const clickHandlerPoint = `    if (effectiveTool === 'house' || effectiveTool === 'bad_house' || effectiveTool === 'temple' || effectiveTool === 'mosque' || effectiveTool === 'church' || effectiveTool === 'gurudwara' || effectiveTool === 'text') {
      const pos = getRelativePointerPosition(stageRef.current);
      setHouseModal({ isOpen: true, x: pos.x, y: pos.y, tool: effectiveTool });
      return;
    }`;
const newClickHandlerPoint = `${clickHandlerPoint}

    if (effectiveTool === 'well' || effectiveTool === 'pipe' || effectiveTool === 'hand_pump') {
      const pos = getRelativePointerPosition(stageRef.current);
      const newElement = {
        id: \`\${effectiveTool}_\${Date.now()}\`,
        type: effectiveTool,
        x: pos.x,
        y: pos.y,
        rotation: 0,
        scaleX: 1,
        scaleY: 1
      };
      handleUpdateRoads([...roads, newElement]);
      setSelectedRoadId(newElement.id);
      return;
    }`;
content = content.replace(clickHandlerPoint, newClickHandlerPoint);

const lineToolsConditionOld = `if (effectiveTool === 'road' || effectiveTool === 'boundary' || effectiveTool === 'bad_road' || effectiveTool === 'path' || effectiveTool === 'railway' || effectiveTool === 'pond') {`;
const lineToolsConditionNew = `if (effectiveTool === 'road' || effectiveTool === 'boundary' || effectiveTool === 'bad_road' || effectiveTool === 'path' || effectiveTool === 'railway' || effectiveTool === 'pond' || effectiveTool === 'river' || effectiveTool === 'canal') {`;
content = content.replace(lineToolsConditionOld, lineToolsConditionNew);

// 4. Mouse Move and Selection anchors logic updates
content = content.replace(
  /effectiveTool === 'pond'\)/g,
  `effectiveTool === 'pond' || effectiveTool === 'river' || effectiveTool === 'canal')`
);
content = content.replace(
  /type === 'pond'\)/g,
  `type === 'pond' || type === 'river' || type === 'canal')`
);

// 5. Line Rendering (River and Canal)
const railwayRenderStr = `) : type === 'railway' ? (`;
const riverCanalRenderStr = `) : type === 'river' ? (
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
                    </Group>
                  ) : type === 'canal' ? (
                    <Group>
                      <Line
                        points={road.points}
                        stroke="#0ea5e9"
                        strokeWidth={16}
                        lineCap="butt"
                        lineJoin="miter"
                        tension={0}
                        closed={road.isClosed}
                        fillEnabled={false}
                        onClick={() => {
                          if (effectiveTool === 'select') setSelectedRoadId(road.id);
                          else if (effectiveTool === 'eraser') handleUpdateRoads(roads.filter(r => r.id !== road.id));
                        }}
                        hitStrokeWidth={30}
                      />
                      <Line
                        points={road.points}
                        stroke="#ffffff"
                        strokeWidth={12}
                        lineCap="butt"
                        lineJoin="miter"
                        tension={0}
                        closed={road.isClosed}
                        fillEnabled={false}
                        listening={false}
                      />
                    </Group>
                  ${railwayRenderStr}`;
content = content.replace(railwayRenderStr, riverCanalRenderStr);

// 6. Point Rendering (Well, Pipe, Hand Pump)
const pointToolsRender = `) : type === 'well' ? (
                    <Group
                      ref={(node) => { shapeRefs.current[road.id] = node; }}
                      x={road.x} y={road.y} rotation={road.rotation || 0}
                      scaleX={road.scaleX || 1} scaleY={road.scaleY || 1}
                      draggable={effectiveTool === 'select'}
                      onClick={() => { 
                        if (effectiveTool === 'eraser') handleUpdateRoads(roads.filter(r => r.id !== road.id)); 
                        else if (effectiveTool === 'select') setSelectedRoadId(road.id);
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
                            ...r, x: node.x(), y: node.y(), rotation: node.rotation(), scaleX: node.scaleX(), scaleY: node.scaleY()
                          } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                    >
                      <Circle x={0} y={0} radius={houseSize * 0.25} stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.05)} fill="#ffffff" />
                      <Circle x={0} y={0} radius={houseSize * 0.05} fill="#374151" listening={false} />
                    </Group>
                  ) : type === 'pipe' ? (
                    <Group
                      ref={(node) => { shapeRefs.current[road.id] = node; }}
                      x={road.x} y={road.y} rotation={road.rotation || 0}
                      scaleX={road.scaleX || 1} scaleY={road.scaleY || 1}
                      draggable={effectiveTool === 'select'}
                      onClick={() => { 
                        if (effectiveTool === 'eraser') handleUpdateRoads(roads.filter(r => r.id !== road.id)); 
                        else if (effectiveTool === 'select') setSelectedRoadId(road.id);
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
                            ...r, x: node.x(), y: node.y(), rotation: node.rotation(), scaleX: node.scaleX(), scaleY: node.scaleY()
                          } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                    >
                      <Rect x={-houseSize * 0.15} y={-houseSize * 0.3} width={houseSize * 0.3} height={houseSize * 0.6} fill="#94a3b8" stroke="#334155" strokeWidth={Math.max(1, houseSize * 0.04)} cornerRadius={houseSize * 0.05} />
                      <Line points={[-houseSize * 0.15, -houseSize * 0.1, houseSize * 0.15, -houseSize * 0.1]} stroke="#334155" strokeWidth={Math.max(1, houseSize * 0.03)} listening={false} />
                      <Line points={[-houseSize * 0.15, houseSize * 0.1, houseSize * 0.15, houseSize * 0.1]} stroke="#334155" strokeWidth={Math.max(1, houseSize * 0.03)} listening={false} />
                    </Group>
                  ) : type === 'hand_pump' ? (
                    <Group
                      ref={(node) => { shapeRefs.current[road.id] = node; }}
                      x={road.x} y={road.y} rotation={road.rotation || 0}
                      scaleX={road.scaleX || 1} scaleY={road.scaleY || 1}
                      draggable={effectiveTool === 'select'}
                      onClick={() => { 
                        if (effectiveTool === 'eraser') handleUpdateRoads(roads.filter(r => r.id !== road.id)); 
                        else if (effectiveTool === 'select') setSelectedRoadId(road.id);
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
                            ...r, x: node.x(), y: node.y(), rotation: node.rotation(), scaleX: node.scaleX(), scaleY: node.scaleY()
                          } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                    >
                      {/* Base */}
                      <Rect x={-houseSize * 0.08} y={-houseSize * 0.1} width={houseSize * 0.16} height={houseSize * 0.4} fill="#64748b" stroke="#334155" strokeWidth={Math.max(1, houseSize * 0.03)} />
                      {/* Handle */}
                      <Line points={[0, houseSize * 0.0, houseSize * 0.35, -houseSize * 0.2]} stroke="#334155" strokeWidth={Math.max(2, houseSize * 0.04)} lineCap="round" />
                      {/* Spout */}
                      <Line points={[-houseSize * 0.08, houseSize * 0.1, -houseSize * 0.25, houseSize * 0.15]} stroke="#334155" strokeWidth={Math.max(2, houseSize * 0.04)} lineCap="round" />
                      <Circle x={-houseSize * 0.25} y={houseSize * 0.15} radius={houseSize * 0.03} fill="#0ea5e9" />
                    </Group>
                  ) : null}`;

content = content.replace(
  /\) : null\}\s*\n\s*\{\/\* Selection Anchors/,
  `\n${pointToolsRender}\n                  \n                  {/* Selection Anchors`
);

// 7. Text/Point tools Transformer condition
content = content.replace(
  /r\.type === 'text'\) && \(/,
  `['text', 'well', 'pipe', 'hand_pump'].includes(r.type)) && (`
);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('Tools patch complete.');
