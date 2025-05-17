# 走线吧 (zouxianba.com)

# 一个现代化的社交平台。

# 全局SEO优化关键字：走线

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- Axios

### 后端
- Node.js
- Express.js
- MongoDB
- JWT 认证
- Multer (文件上传)

## 本地开发

### 前端
```bash
cd client
npm install
npm run dev
```

### 后端
```bash
cd server
npm install
npm run dev
```

## 环境变量配置

1. 复制 `.env.example` 到 `.env`
2. 填写必要的环境变量：
   - MongoDB URI
   - JWT Secret
   - 其他配置项

## 部署

### 前端部署 (Vercel)
1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 后端部署 (Render)
1. 在 Render 中创建新的 Web Service
2. 连接 GitHub 仓库
3. 配置环境变量
4. 部署

## 功能特性

- 用户认证系统
- 信息流发布与互动
- 多媒体内容支持
- 响应式设计
- 移动端优化
- 暗色模式支持

## 项目结构

```
.
├── client/                 # 前端项目
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── pages/        # 页面组件
│   │   ├── hooks/        # 自定义 Hooks
│   │   ├── services/     # API 服务
│   │   └── utils/        # 工具函数
│   └── public/           # 静态资源
│
└── server/                # 后端项目
    ├── src/
    │   ├── controllers/  # 控制器
    │   ├── models/       # 数据模型
    │   ├── routes/       # 路由
    │   ├── middleware/   # 中间件
    │   └── utils/        # 工具函数
    └── uploads/          # 文件上传目录
```

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT 