const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

// 1. Update imports
content = content.replace(
  /\} from 'lucide-react';/,
  `, TrainTrack, AlignJustify, CircleDot, Pipette, Factory } from 'lucide-react';`
);

// 2. Replace icons in the toolbar
content = content.replace(/<Train size=\{20\} \/>/, `<TrainTrack size={20} />`);
content = content.replace(/<Triangle size=\{20\} \/>/, `<Factory size={20} />`);
content = content.replace(/<Equal size=\{20\} \/>/, `<AlignJustify size={20} />`);
content = content.replace(/<Target size=\{20\} \/>/, `<CircleDot size={20} />`);
content = content.replace(/<Cylinder size=\{20\} \/>/, `<Pipette size={20} />`);

// 3. Update titles for clarity
content = content.replace(/title="Place Bad Building"/, `title="Place Non-Residential"`);
content = content.replace(/title="Draw Bad Road"/, `title="Draw Unpaved Road"`);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('Icons patch complete.');
