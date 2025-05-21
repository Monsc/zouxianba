# ZouXianBa Server

ZouXianBa 是一个现代化的社交媒体平台，提供实时语音聊天、文字聊天、图片分享等功能。这是服务器端代码。

## 功能特性

- 用户认证和授权
- 实时语音聊天
- 语音转文字
- 表情反应
- 背景音乐
- 录音和回放
- 文件上传和存储
- WebSocket 实时通信
- RESTful API

## 技术栈

- Node.js
- Express.js
- MongoDB
- Socket.IO
- JWT 认证
- Cloudflare R2 存储
- Winston 日志

## 开始使用

### 环境要求

- Node.js >= 14.0.0
- MongoDB >= 4.0.0
- npm >= 6.0.0

### 安装

1. 克隆仓库：

```bash
git clone https://github.com/yourusername/zouxianba-server.git
cd zouxianba-server
```

2. 安装依赖：

```bash
npm install
```

3. 配置环境变量：

复制 `.env.example` 文件为 `.env`，并填写必要的配置信息：

```bash
cp .env.example .env
```

4. 启动开发服务器：

```bash
npm run dev
```

### 生产环境部署

1. 构建项目：

```bash
npm run build
```

2. 启动服务器：

```bash
npm start
```

## API 文档

### 认证

- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- POST /api/auth/logout - 用户登出
- GET /api/auth/me - 获取当前用户信息

### 语音聊天

- POST /api/voice-chat/rooms - 创建语音聊天房间
- GET /api/voice-chat/rooms - 获取语音聊天房间列表
- GET /api/voice-chat/rooms/:id - 获取单个语音聊天房间
- POST /api/voice-chat/rooms/:id/join - 加入语音聊天房间
- POST /api/voice-chat/rooms/:id/leave - 离开语音聊天房间
- PATCH /api/voice-chat/rooms/:id/settings - 更新房间设置
- POST /api/voice-chat/rooms/:id/recording/start - 开始录制
- POST /api/voice-chat/rooms/:id/recording/stop - 停止录制
- POST /api/voice-chat/rooms/:id/end - 结束房间

## WebSocket 事件

### 客户端到服务器

- joinRoom - 加入房间
- leaveRoom - 离开房间
- mute - 静音/取消静音
- raiseHand - 举手/取消举手
- startRecording - 开始录制
- stopRecording - 停止录制
- reaction - 发送表情反应
- transcript - 发送语音转文字
- backgroundMusic - 控制背景音乐

### 服务器到客户端

- participantJoined - 新参与者加入
- participantLeft - 参与者离开
- participantMuted - 参与者静音状态变化
- participantRaisedHand - 参与者举手状态变化
- recordingStarted - 开始录制
- recordingStopped - 停止录制
- reaction - 收到表情反应
- transcript - 收到语音转文字
- backgroundMusic - 收到背景音乐控制
- roomSettingsUpdated - 房间设置更新
- roomEnded - 房间结束

## 开发

### 代码风格

项目使用 ESLint 和 Prettier 进行代码格式化和检查：

```bash
npm run lint
npm run format
```

### 测试

运行测试：

```bash
npm test
```

## 贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。 