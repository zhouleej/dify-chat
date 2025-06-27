# Dify Chat Web 的 Next.js 实现【WIP】

> 注意：当前 package 仍在开发中，暂不可用，敬请期待。

## Why me?

- 通过服务端调用 Dify API，密钥信息不会在客户端传输和存储

### 环境变量配置

第一步，生成 session 密钥：

```bash
openssl rand -base64 32
```

在根目录新增 `.env` 文件，增加如下配置项：

```bash
# .env
RUNNING_MODE=multiApp # 应用模式, 可选值：singleApp-单应用, multiApp-多应用
SESSION_SECRET=xxx # 上面生成的 Session 密钥
```

## 本地开发

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Todos

- [x] 把 react-app 以及其他子包的依赖升级到 react 19
- [ ] 子包依赖本地开发热更新
- [x] 移除 DC-User 机制，通过 cookie 解析 jwt token 获取 userId
- [x] 上传文件支持（Dify UploadFile API）

## Project Tree

初步的目录设计：

```bash
├── app/                  # App Router 页面和路由
│   ├── [dynamic]/        # 动态路由（如博客文章）
│   ├── api/              # API 路由
│   │   ├── auth/         # 认证相关 API
│   │   │   ├── login/    # 登录接口
│   │   │   │   └── route.ts
│   │   │   └── register/
│   │   │       └── route.ts
│   │   ├── posts/        # 文章相关 API
│   │   │   └── route.ts
│   │   └── route.ts      # 根 API 路由（可选）
│   ├── globals.css       # 全局样式
│   ├── layout.tsx        # 全局布局
│   ├── page.tsx          # 首页
│   └── search/           # 搜索页面
│       └── page.tsx
├── components/           # 可复用组件
│   ├── ui/               # UI 组件（按钮、表单等）
│   └── features/         # 功能组件（文章列表、评论等）
├── lib/                  # 工具库和辅助函数
│   ├── db/               # 数据库操作
│   ├── auth/             # 认证逻辑
│   └── utils/            # 通用工具函数
├── models/               # 数据模型（如 Prisma 模型）
├── public/               # 静态资源
├── types/                # TypeScript 类型定义
└── next.config.js        # Next.js 配置
```
