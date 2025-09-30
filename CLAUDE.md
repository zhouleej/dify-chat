# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Dify Chat is an AI application platform built on Dify API, organized as a pnpm workspace monorepo with the following packages in the `packages/` directory:

### Core Packages

- **react-app**: React frontend application (port 5200) - main user interface for Dify interactions
- **platform**: Next.js 15 App Router application (port 5300) - provides application configuration CRUD and Dify API proxy
- **api**: Node.js client library for Dify API
- **core**: Core package containing shared abstractions and business logic
- **helpers**: Utility functions shared across packages
- **theme**: Theme components and styling shared across applications

### Other Packages

- **docs**: Documentation built with Rspress
- **components**: Legacy component library (**DEPRECATED** - do not modify or import)

## Development Commands

### Setup and Development

```bash
# Install dependencies
pnpm install

# Start local development (runs both react-app and platform)
./dev-start.sh

# Build all packages
pnpm build

# Build only publishable packages
pnpm build:pkgs

# Start individual services
pnpm dev:react      # React app only (port 5200)
pnpm dev:platform   # Platform only (port 5300)
pnpm dev:docs       # Documentation site
```

### Quality Assurance

```bash
# Run linting across all packages
pnpm lint

# Format code across all packages
pnpm format

# Run tests across all packages
pnpm test
```

### Database Management (Platform)

```bash
# Initialize database
pnpm --filter dify-chat-platform db:generate
pnpm --filter dify-chat-platform db:push

# Create admin user
pnpm create-admin

# Database utilities
pnpm --filter dify-chat-platform db:studio
pnpm --filter dify-chat-platform db:migrate
```

## Architecture

### Monorepo Structure

- Uses pnpm workspace with catalog protocol for dependency management
- All dependency versions centrally managed in `pnpm-workspace.yaml` catalog section
- Packages use `workspace:^` protocol for internal dependencies

### Technology Stack

- **Frontend**: React 19, Ant Design v5, Ant Design X v1
- **Build Tools**: Rsbuild v1 (react-app), Next.js 15 (platform)
- **Styling**: Tailwind CSS v3 (react-app), Tailwind CSS v4 (platform)
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **Authentication**: NextAuth.js v4
- **Package Manager**: pnpm ^10.8.1
- **Node.js**: ^22.5.1

### Key Architectural Patterns

- **Workspace Dependencies**: Internal packages reference each other using workspace protocol
- **Shared Components**: Common UI components in theme package
- **API Abstraction**: Centralized Dify API client in api package
- **Environment Configuration**: Separate .env files for react-app and platform with different port configurations

## Development Notes

### Dependency Management

When adding/updating dependencies:

1. Add version to `pnpm-workspace.yaml` catalog section
2. Reference in package.json using `"catalog:"`
3. Run `pnpm install` from repository root

### Styling Differences

- **react-app**: Uses Tailwind CSS v3 (managed via catalog)
- **platform**: Uses Tailwind CSS v4 (version in package.json)

### Environment Variables

- **React App**: Uses `PUBLIC_APP_API_BASE` and `PUBLIC_DIFY_PROXY_API_BASE`
- **Platform**: Requires `DATABASE_URL` and `NEXTAUTH_SECRET`

### Testing Framework

- Uses Vitest for core packages
- Test command: `pnpm test` (runs across all packages)

## Important Constraints

- **NEVER** modify or import from the `components` package (deprecated)
- Always use the centralized catalog system for dependency versions
- Respect the dual Tailwind CSS version setup between react-app and platform
- Use workspace protocol for internal package dependencies
