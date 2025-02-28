# Dify Chat Web

一个基于 Dify API 的 AI 会话聊天 Web 应用。

## 技术栈

- React v18
- Ant Design v5
- Ant Design X v1
- Rsbuild v1
- Tailwind CSS v3
- TypeScript v5

## 开始

在根目录创建一个 `.env.local` 文件，并添加以下环境变量:

```bash
# Dify API 域名，如果是私有化部署，请修改为你的域名
DIFY_API_BASE=https://api.dify.ai
# Dify API 版本，固定为 /v1
DIFY_API_VERSION=/v1
# Dify API Key，在 Dify 后台获取，生成的是一个 app- 开头的 key
DIFY_API_KEY=app-YOUR_API_KEY
```

安装依赖:

```bash
pnpm install
```

启动开发服务器：

```bash
pnpm dev
```

构建生产版本：

```bash
pnpm build
```

预览生产版本：

```bash
pnpm preview
```
