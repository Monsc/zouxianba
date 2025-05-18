# 走线吧 (zouxianba.com)

一个现代化的社交平台，致力于为用户提供安全、高效、友好的社交体验。

## 项目状态

### 已完成功能
- ✅ 用户认证系统（登录/注册）
- ✅ 个人资料管理
- ✅ 信息流发布与互动
- ✅ 多媒体内容支持
- ✅ 响应式设计
- ✅ 暗色模式支持
- ✅ 消息系统
- ✅ 话题标签功能
- ✅ 提及功能

### 待优化项目
1. **安全性增强**
   - [ ] 实现 CSRF 保护
   - [ ] 添加 API 请求签名
   - [ ] 实现账号锁定机制
   - [ ] 添加双因素认证
   - [ ] 增强密码策略

2. **性能优化**
   - [ ] 实现图片懒加载
   - [ ] 优化首屏加载时间
   - [ ] 添加服务端渲染
   - [ ] 实现数据缓存策略

3. **移动端优化**
   - [ ] 优化触摸交互
   - [ ] 添加更多断点适配
   - [ ] 实现 PWA 功能
   - [ ] 优化图片加载策略

4. **功能完善**
   - [ ] 添加高级搜索功能
   - [ ] 实现内容审核系统
   - [ ] 添加数据分析功能
   - [ ] 实现用户反馈系统

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- Axios
- Socket.IO Client

### 后端
- Node.js
- Express.js
- MongoDB
- JWT 认证
- Multer (文件上传)
- Socket.IO
- Redis (计划中)

## 本地开发

### 环境要求
- Node.js >= 16
- MongoDB >= 4.4
- npm >= 7

### 前端开发
```bash
cd client
npm install
npm run dev
```

### 后端开发
```bash
cd server
npm install
npm run dev
```

## 环境变量配置

1. 复制 `.env.example` 到 `.env`
2. 填写必要的环境变量：
   ```
   # 数据库配置
   MONGODB_URI=your_mongodb_uri
   
   # JWT配置
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   
   # 服务器配置
   PORT=3000
   NODE_ENV=development
   
   # 文件上传配置
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880
   ```

## 项目结构

```
.
├── client/                 # 前端项目
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── pages/        # 页面组件
│   │   ├── hooks/        # 自定义 Hooks
│   │   ├── services/     # API 服务
│   │   ├── contexts/     # React Context
│   │   ├── styles/       # 样式文件
│   │   └── utils/        # 工具函数
│   └── public/           # 静态资源
│
└── server/                # 后端项目
    ├── src/
    │   ├── controllers/  # 控制器
    │   ├── models/       # 数据模型
    │   ├── routes/       # 路由
    │   ├── middleware/   # 中间件
    │   ├── services/     # 业务逻辑
    │   └── utils/        # 工具函数
    └── uploads/          # 文件上传目录
```

## 贡献指南

我们欢迎所有形式的贡献，包括但不限于：

1. 功能开发
2. Bug 修复
3. 文档改进
4. 性能优化
5. 安全增强

### 如何贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发规范

- 遵循 TypeScript 规范
- 使用 ESLint 和 Prettier 保持代码风格一致
- 编写单元测试
- 保持代码简洁和可维护性
- 及时更新文档

## 问题反馈

如果你发现任何问题或有改进建议，请：

1. 查看 [Issues](https://github.com/yourusername/zxb/issues) 是否已存在
2. 创建新的 Issue，并包含：
   - 问题描述
   - 复现步骤
   - 期望行为
   - 实际行为
   - 环境信息

## 安全报告

如果你发现任何安全漏洞，请：

1. 不要公开披露
2. 发送邮件到 security@zouxianba.com
3. 我们将尽快处理并回复

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目维护者：[维护者姓名]
- 邮箱：contact@zouxianba.com
- 网站：https://zouxianba.com

## 致谢

感谢所有为项目做出贡献的开发者！ 