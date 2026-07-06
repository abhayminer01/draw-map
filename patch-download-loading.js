const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

// 1. Add isDownloading state
content = content.replace(
  /const \[isAutosavingIndicator, setIsAutosavingIndicator\] = useState\(false\);/,
  `const [isAutosavingIndicator, setIsAutosavingIndicator] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);`
);

// 2. Modify handleDownloadPDF start
content = content.replace(
  /const handleDownloadPDF = \(\) => \{\s*\n\s*const stage = stageRef\.current;\s*\n\s*if \(\!stage\) return;/,
  `const handleDownloadPDF = () => {
    const stage = stageRef.current;
    if (!stage) return;
    setIsDownloading(true);
    
    setTimeout(() => {`
);

// 3. Modify handleDownloadPDF end
content = content.replace(
  /pdf\.save\(`\$\{mapData\?\.name \|\| 'Map'\}\.pdf`\);\s*\n\s*\};/,
  `pdf.save(\`\${mapData?.name || 'Map'}.pdf\`);
      setIsDownloading(false);
    }, 50);
  };`
);

// 4. Update the button
content = content.replace(
  /<button \s*\n\s*onClick=\{handleDownloadPDF\}\s*\n\s*className="p-2 rounded-lg hover:bg-white\/10 text-gray-400 hover:text-white transition-all"\s*\n\s*title="Download PDF \(A3\)"\s*\n\s*>\s*\n\s*<Download size=\{18\} \/>\s*\n\s*<\/button>/,
  `<button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50"
            title="Download PDF (A3)"
          >
            {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          </button>`
);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('Download loading patch complete.');
