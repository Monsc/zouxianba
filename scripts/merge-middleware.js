const fs = require('fs');
const path = require('path');

const middlewareDir = path.join(__dirname, '../server/src/middleware');
const middlewaresDir = path.join(__dirname, '../server/src/middlewares');

// 确保目标目录存在
if (!fs.existsSync(middlewareDir)) {
  fs.mkdirSync(middlewareDir, { recursive: true });
}

// 读取 middlewares 目录中的文件
const files = fs.readdirSync(middlewaresDir);

// 移动文件
files.forEach(file => {
  const sourcePath = path.join(middlewaresDir, file);
  const targetPath = path.join(middlewareDir, file);
  
  // 如果目标文件已存在，添加后缀
  if (fs.existsSync(targetPath)) {
    const ext = path.extname(file);
    const name = path.basename(file, ext);
    const newPath = path.join(middlewareDir, `${name}_new${ext}`);
    fs.renameSync(sourcePath, newPath);
  } else {
    fs.renameSync(sourcePath, targetPath);
  }
});

// 删除空的 middlewares 目录
fs.rmdirSync(middlewaresDir);

console.log('Middleware directories merged successfully!'); 