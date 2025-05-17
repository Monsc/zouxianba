const fs = require('fs');
const path = require('path');

const dirsToRemove = [
  'node_modules',
  'frontend',
  'backend',
  'client/node_modules',
  'server/dist'
];

dirsToRemove.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`Removed ${dir}`);
  }
}); 