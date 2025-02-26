# Rsbuild Project

## Setup

Install the dependencies:

```bash
pnpm install
```

## Get Started

Before you start, create a `.env.local` file in the root directory and add the following environment variables:

```bash
DIFY_API_BASE=YOUR_DIFY_DEPLOY_DOMAIN
DIFY_API_VERSION=/v1
DIFY_API_KEY=YOUR_APP_ID
```

Start the dev server:

```bash
pnpm dev
```

Build the app for production:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```
