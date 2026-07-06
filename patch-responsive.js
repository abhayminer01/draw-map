const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

// 1. Add Menu to imports
content = content.replace(
  /, Factory, Droplet \} from 'lucide-react';/,
  `, Factory, Droplet, Menu } from 'lucide-react';`
);

// 2. Add state
const stateTarget = `const [isAutosavingIndicator, setIsAutosavingIndicator] = useState(false);`;
const stateInsert = `const [isAutosavingIndicator, setIsAutosavingIndicator] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);`;
content = content.replace(stateTarget, stateInsert);

// 3. Add handleToolSelect
const handleToolSelectInsert = `
  const handleToolSelect = (tool) => {
    setActiveTool(tool);
    setSelectedRoadId(null);
    setPendingRoad(null);
    setIsMobileMenuOpen(false);
  };
`;
content = content.replace(/const handleUndo = \(\) => \{/, `${handleToolSelectInsert}\n  const handleUndo = () => {`);

// 4. Update Header
const headerTarget = `<header className="h-16 border-b border-white/10 bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
          <h1 className="text-lg font-medium">{mapData.name}</h1>
        </div>`;

const headerReplace = `<header className="h-16 border-b border-white/10 bg-surface/80 backdrop-blur-md flex items-center justify-between px-2 md:px-6 z-20 shrink-0">
        <div className="flex items-center gap-1 md:gap-4">
          <button 
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={20} />
          </button>
          <Link to="/dashboard" className="p-2 md:-ml-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div className="hidden md:block h-6 w-[1px] bg-white/10 mx-2"></div>
          <h1 className="text-base md:text-lg font-medium truncate max-w-[100px] md:max-w-xs">{mapData.name}</h1>
        </div>`;
content = content.replace(headerTarget, headerReplace);

// Update Save Progress text
const saveTextTarget = `Save Progress\n          </button>`;
const saveTextReplace = `<span className="hidden md:inline">Save</span>\n          </button>`;
content = content.replace(saveTextTarget, saveTextReplace);

// 5. Update Toolbar container
const asideTarget = `<aside 
          className="w-16 bg-surface/90 border-r border-white/10 z-20 flex flex-col items-center py-4 gap-4 overflow-y-auto overflow-x-hidden shrink-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >`;

const asideReplace = `{/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden absolute inset-0 bg-black/50 z-20"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        <aside 
          className={\`absolute md:relative left-0 top-0 h-full w-16 bg-surface/95 backdrop-blur-xl border-r border-white/10 z-30 flex flex-col items-center py-4 gap-4 overflow-y-auto overflow-x-hidden shrink-0 transition-transform duration-300 \${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}\`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >`;
content = content.replace(asideTarget, asideReplace);

// 6. Replace all tool onClick handlers
content = content.replace(/onClick=\{\(\) => \{ setActiveTool\('([^']+)'\);[^\n]*?\}\}/g, `onClick={() => handleToolSelect('$1')}`);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('Responsive patch complete.');
