const lucide = require('lucide-react');
const icons = Object.keys(lucide);
const matches = icons.filter(icon => 
  icon.toLowerCase().includes('tap') || 
  icon.toLowerCase().includes('pipe') || 
  icon.toLowerCase().includes('water') || 
  icon.toLowerCase().includes('drop') || 
  icon.toLowerCase().includes('tube') || 
  icon.toLowerCase().includes('shower') ||
  icon.toLowerCase().includes('faucet') ||
  icon.toLowerCase().includes('plug') ||
  icon.toLowerCase().includes('wrench')
);
console.log('Matches:', matches.join(', '));
