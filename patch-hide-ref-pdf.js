const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

const targetBefore = `    // Generate image from canvas (pixelRatio 2 for high quality)
    // Export exactly the logical A3 dimensions, ignoring viewport size`;

const insertBefore = `    // Hide reference image and transformers before export
    const wasRefVisible = refImageNode.current ? refImageNode.current.visible() : false;
    const wasTrVisible = trRef.current ? trRef.current.visible() : false;
    const wasTrTextVisible = trTextRef.current ? trTextRef.current.visible() : false;
    
    if (refImageNode.current) refImageNode.current.hide();
    if (trRef.current) trRef.current.hide();
    if (trTextRef.current) trTextRef.current.hide();

    // Generate image from canvas (pixelRatio 2 for high quality)
    // Export exactly the logical A3 dimensions, ignoring viewport size`;

content = content.replace(targetBefore, insertBefore);

const targetAfter = `    // Restore stage position
    stage.scaleX(oldScale);
    stage.scaleY(oldScale);
    stage.x(oldX);
    stage.y(oldY);`;

const insertAfter = `    // Restore stage position
    stage.scaleX(oldScale);
    stage.scaleY(oldScale);
    stage.x(oldX);
    stage.y(oldY);
    
    // Restore visibility
    if (refImageNode.current && wasRefVisible) refImageNode.current.show();
    if (trRef.current && wasTrVisible) trRef.current.show();
    if (trTextRef.current && wasTrTextVisible) trTextRef.current.show();`;

content = content.replace(targetAfter, insertAfter);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('PDF export patch complete.');
