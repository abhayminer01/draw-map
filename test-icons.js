const lucide = require('lucide-react');
const icons = Object.keys(lucide);
const search = ['TrainTrack', 'CircleDot', 'AlignJustify', 'Pipette', 'ShowerHead', 'Droplets', 'Menu', 'GripVertical', 'Droplet', 'Target', 'Equal', 'Cylinder', 'Wind'];

search.forEach(name => {
  console.log(`${name}: ${icons.includes(name)}`);
});
