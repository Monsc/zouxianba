# 社交媒体平台

一个现代化的社交媒体平台，支持用户互动、内容分享和实时通信。

## 功能特性

### 用户系统
- 用户注册和登录
- 个人信息管理
- 头像上传
- 密码修改
- 个人主页

### 内容系统
- 发布帖子
- 支持图片上传
- 编辑和删除帖子
- 点赞和评论
- 帖子详情页

### 社交系统
- 关注/取消关注
- 关注者列表
- 关注中列表
- 用户搜索

### 通知系统
- 点赞通知
- 评论通知
- 关注通知
- @提及通知
- 通知已读状态

### 消息系统
- 私信列表
- 实时聊天
- 消息已读状态
- 图片消息支持

### 搜索系统
- 搜索帖子
- 搜索用户
- 实时搜索
- 搜索结果分类

### 设置系统
- 个人信息设置
- 头像设置
- 密码设置
- 主题设置（开发中）
- 语言设置（开发中）

## 技术栈

### 前端
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- SWR (数据获取)
- Socket.IO (实时通信)

### 后端
- Node.js
- Express
- TypeScript
- PostgreSQL
- Redis
- Socket.IO

### 工具和库
- Prisma (ORM)
- JWT (认证)
- bcrypt (密码加密)
- multer (文件上传)
- date-fns (日期处理)
- zod (数据验证)

## 开发环境要求

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- pnpm 8+

## 安装说明

1. 克隆仓库
```bash
git clone https://github.com/yourusername/social-media-platform.git
cd social-media-platform
```

2. 安装依赖
```bash
# 安装后端依赖
cd server
pnpm install

# 安装前端依赖
cd ../client
pnpm install
```

3. 环境配置
```bash
# 后端环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库和 Redis 连接信息

# 前端环境变量
cp .env.example .env.local
# 编辑 .env.local 文件，配置 API 地址
```

4. 数据库迁移
```bash
cd server
pnpm prisma migrate dev
```

5. 启动开发服务器
```bash
# 启动后端服务器
cd server
pnpm dev

# 启动前端服务器
cd ../client
pnpm dev
```

## 项目结构

```
.
├── client/                 # 前端项目
│   ├── src/
│   │   ├── app/           # 页面组件
│   │   ├── components/    # 通用组件
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── services/      # API 服务
│   │   ├── styles/        # 样式文件
│   │   └── utils/         # 工具函数
│   └── public/            # 静态资源
│
└── server/                # 后端项目
    ├── src/
    │   ├── controllers/   # 控制器
    │   ├── middleware/    # 中间件
    │   ├── models/        # 数据模型
    │   ├── routes/        # 路由
    │   ├── services/      # 业务逻辑
    │   └── utils/         # 工具函数
    └── prisma/            # 数据库模型
```

## 开发规范

### 代码风格
- 使用 ESLint 和 Prettier 进行代码格式化
- 遵循 TypeScript 严格模式
- 使用函数组件和 Hooks
- 使用 Tailwind CSS 进行样式管理

### Git 提交规范
- feat: 新功能
- fix: 修复问题
- docs: 文档修改
- style: 代码格式修改
- refactor: 代码重构
- test: 测试用例修改
- chore: 其他修改

### 分支管理
- main: 主分支，用于生产环境
- develop: 开发分支，用于开发环境
- feature/*: 功能分支，用于开发新功能
- bugfix/*: 修复分支，用于修复问题

## 部署

### 前端部署
1. 构建生产版本
```bash
cd client
pnpm build
```

2. 部署到服务器
```bash
# 使用 PM2 部署
pm2 start npm --name "social-media-client" -- start
```

### 后端部署
1. 构建生产版本
```bash
cd server
pnpm build
```

2. 部署到服务器
```bash
# 使用 PM2 部署
pm2 start npm --name "social-media-server" -- start
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目维护者：[维护者姓名]
- 邮箱：contact@zouxianba.com
- 网站：https://zouxianba.com

## 致谢

感谢所有为项目做出贡献的开发者！ 