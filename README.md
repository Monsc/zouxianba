# 走线吧 (Zouxianba) - 现代化社交媒体平台

> 对标 X（Twitter），极致响应式，自动深色/浅色主题，支持高并发与高可用的全栈社交平台

## 技术栈

- **前端**：React 18, Vite, Tailwind CSS, SWR, React Context, Socket.IO Client
- **后端**：Node.js, Express, MongoDB, Redis, Elasticsearch, RabbitMQ, Socket.IO
- **基础设施**：Docker, Kubernetes, GitHub Actions, Prometheus, Grafana, ELK, Cloudflare

## 主要特性

- 多方式注册登录（邮箱、手机、第三方）、OAuth2.0、2FA
- 富文本编辑、图片/视频上传、内容审核与推荐
- 关注/粉丝、用户关系图谱、社交推荐
- 实时私信、群聊、消息加密与撤回
- 实时通知、智能聚合、历史记录
- 全文搜索、实时建议
- 高性能缓存、分布式会话、限流熔断
- 安全防护（XSS/CSRF/SQL注入/加密/脱敏）

## 响应式与主题适配

- 三栏响应式布局，桌面端左侧导航+主内容+右侧推荐，移动端底部导航
- 桌面端主内容区顶部始终可见发布框，移动端悬浮发帖按钮弹出发布框
- 自动适配系统深色/浅色主题，所有主要区域高对比度适配

## 快速开始

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/zouxianba.git
   cd zouxianba
   ```

2. 配置环境变量
   ```bash
   cp .env.example .env
   cp .env.example .env.local
   # 编辑 .env 和 .env.local
   ```

3. 启动开发环境
   ```bash
   docker-compose up -d
   ```

4. 安装依赖并启动前后端
   ```bash
   cd server && pnpm install && pnpm dev
   cd ../client && pnpm install && pnpm dev
   ```

## 目录结构

```
.
├── client/      # 前端项目
├── server/      # 后端项目
├── docker/      # Docker 配置
├── scripts/     # 部署脚本
└── docs/        # 项目文档
```

## 贡献指南

1. Fork 项目
2. 创建分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -m 'feat: xxx'`)
4. 推送分支 (`git push origin feature/xxx`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 联系方式

- 邮箱：contact@zouxianba.com
- 官网：https://zouxianba.com

---

> 本项目致力于打造中国最现代化的开源社交平台，欢迎 Star、Fork、贡献代码和建议！

