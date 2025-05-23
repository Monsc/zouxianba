# 组件文档

## 组件结构

```
components/
  ├── auth/           # 认证相关组件
  ├── common/         # 通用组件
  ├── layout/         # 布局组件
  ├── notifications/  # 通知相关组件
  ├── ui/            # UI 基础组件
  └── voice-chat/    # 语音聊天组件
```

## 组件开发规范

1. 文件命名

   - 使用 PascalCase 命名组件文件
   - 使用 .jsx 扩展名
   - 组件名应与文件名一致

2. 组件结构

   ```jsx
   /**
    * @component ComponentName
    * @description 组件描述
    * @param {Object} props
    * @param {string} props.propName - 属性描述
    * @returns {JSX.Element}
    */
   import React from 'react';
   import PropTypes from 'prop-types';
   import styles from './ComponentName.module.css';

   const ComponentName = ({ propName }) => {
     return <div className={styles.container}>{/* 组件内容 */}</div>;
   };

   ComponentName.propTypes = {
     propName: PropTypes.string.isRequired,
   };

   ComponentName.defaultProps = {
     propName: 'default value',
   };

   export default ComponentName;
   ```

3. 样式规范

   - 使用 CSS Modules 或 Tailwind CSS
   - 遵循 BEM 命名规范
   - 使用 CSS 变量管理主题

4. 性能优化

   - 使用 React.memo 优化渲染
   - 使用 useMemo 和 useCallback 优化计算
   - 使用虚拟列表处理长列表

5. 测试规范
   - 编写单元测试
   - 编写集成测试
   - 测试覆盖率要求 > 80%

## 组件列表

### 认证组件

- `LoginForm` - 登录表单
- `RegisterForm` - 注册表单
- `TwoFactorSetup` - 两步验证设置
- `TwoFactorVerification` - 两步验证验证

### 通用组件

- `Button` - 按钮组件
- `Input` - 输入框组件
- `Select` - 选择框组件
- `Modal` - 模态框组件
- `Toast` - 提示组件

### 布局组件

- `Layout` - 主布局
- `Navbar` - 导航栏
- `Sidebar` - 侧边栏
- `Footer` - 页脚

### 通知组件

- `NotificationList` - 通知列表
- `NotificationItem` - 通知项
- `NotificationCenter` - 通知中心

### UI 组件

- `Avatar` - 头像
- `Badge` - 徽章
- `Card` - 卡片
- `Icon` - 图标
- `LoadingSpinner` - 加载动画

### 语音聊天组件

- `VoiceChat` - 语音聊天
- `VoiceChatControls` - 语音控制
- `VoiceChatParticipants` - 参与者列表
