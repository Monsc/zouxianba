# 走线吧 (Zouxianba) - 现代化社交媒体平台
一个纯粹使用AI构建的实验性项目
一个现代化社交媒体平台，采用微服务架构设计，支持高并发、高可用的用户互动、内容分享和实时通信。

## 系统架构

### 前端架构
- **框架**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS
- **状态管理**: SWR + React Context
- **实时通信**: Socket.IO Client
- **构建工具**: Vite
- **代码规范**: ESLint + Prettier
- **测试**: Jest + React Testing Library

### 后端架构
- **主框架**: Node.js + Express
- **数据库**: 
  - MongoDB (主数据库)
  - Redis (缓存层)
  - Elasticsearch (搜索引擎)
- **消息队列**: RabbitMQ
- **实时通信**: Socket.IO
- **认证**: JWT + Redis Session
- **API文档**: Swagger/OpenAPI

### 基础设施
- **容器化**: Docker + Docker Compose
- **编排**: Kubernetes
- **CI/CD**: GitHub Actions
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack
- **CDN**: Cloudflare

## 核心功能

### 用户系统
- 多方式注册登录 (邮箱、手机、第三方)
- OAuth2.0 认证
- 双因素认证 (2FA)
- 用户画像系统
- 账号安全中心

### 内容系统
- 富文本编辑器
- 图片/视频上传与处理
- 内容审核系统
- 内容推荐算法
- 内容分发网络

### 社交系统
- 关注/粉丝系统
- 用户关系图谱
- 社交推荐
- 用户互动分析
- 社交影响力评估

### 消息系统
- 实时私信
- 群组聊天
- 消息加密
- 消息撤回
- 已读回执

### 通知系统
- 实时推送
- 消息聚合
- 智能通知
- 通知偏好设置
- 通知历史记录

### 搜索系统
- 全文搜索
- 实时搜索建议

## 技术特性

### 高性能
- 多级缓存策略
- 数据库读写分离
- 分布式会话管理
- 请求合并与批处理
- 静态资源优化

### 高可用
- 服务自动扩缩容
- 故障自动转移
- 多区域部署
- 灾备方案
- 限流熔断

### 安全性
- XSS/CSRF 防护
- SQL 注入防护
- 请求频率限制
- 数据加密传输
- 敏感信息脱敏

### 可扩展性
- 微服务架构
- 消息队列解耦
- 分布式缓存
- 服务发现
- 配置中心

## 开发环境要求

- Node.js 18+
- MongoDB 6+
- Redis 7+
- RabbitMQ 3.9+
- Docker 24+
- pnpm 8+

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/yourusername/zouxianba.git
cd zouxianba
```

2. 环境配置
```bash
# 复制环境变量文件
cp .env.example .env
cp .env.example .env.local

# 编辑环境变量
vim .env
vim .env.local
```

3. 使用 Docker Compose 启动开发环境
```bash
docker-compose up -d
```

4. 安装依赖
```bash
# 安装后端依赖
cd server
pnpm install

# 安装前端依赖
cd ../client
pnpm install
```

5. 启动开发服务器
```bash
# 启动后端服务
cd server
pnpm dev

# 启动前端服务
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
├── server/                # 后端项目
│   ├── src/
│   │   ├── config/       # 配置文件
│   │   ├── core/         # 核心功能
│   │   ├── api/          # API 路由
│   │   ├── services/     # 业务逻辑层
│   │   ├── repositories/ # 数据访问层
│   │   ├── models/       # 数据模型
│   │   ├── middlewares/  # 中间件
│   │   └── utils/        # 工具函数
│   └── tests/            # 测试文件
│
├── docker/               # Docker 配置
├── scripts/             # 部署脚本
└── docs/               # 项目文档
```

## 开发规范

### 代码规范
- 使用 ESLint 和 Prettier 进行代码格式化
- 遵循 TypeScript 严格模式
- 使用函数组件和 Hooks
- 使用 Tailwind CSS 进行样式管理
- 遵循 RESTful API 设计规范

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
- release/*: 发布分支，用于版本发布

## 部署

### 开发环境
```bash
docker-compose up -d
```

### 测试环境
```bash
kubectl apply -f k8s/test/
```

### 生产环境
```bash
kubectl apply -f k8s/prod/
```

## 监控与运维

### 系统监控
- 使用 Prometheus 收集指标
- 使用 Grafana 展示监控面板
- 使用 ELK Stack 收集日志
- 使用 Sentry 进行错误追踪

### 性能优化
- 使用 Redis 缓存热点数据
- 使用 CDN 加速静态资源
- 使用消息队列处理异步任务
- 使用数据库索引优化查询
- 使用负载均衡分发请求

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