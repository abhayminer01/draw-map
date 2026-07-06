const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Canvas.jsx', 'utf8');

const targetUpload = `  const handleUploadRef = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setRefImageStr(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };`;

const newUpload = `  const handleUploadRef = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          const MAX_DIM = 1920;
          let width = img.width;
          let height = img.height;
          
          if (width > MAX_DIM || height > MAX_DIM) {
            const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
            width = width * ratio;
            height = height * ratio;
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          setRefImageStr(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };`;

content = content.replace(targetUpload, newUpload);

fs.writeFileSync('client/src/pages/Canvas.jsx', content);
console.log('Upload patch complete.');
