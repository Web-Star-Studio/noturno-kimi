# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Noturno is an AI-powered outbound prospecting automation SaaS. It automatically discovers leads, generates pre-call reports, and creates personalized outreach emails.

## Commands

### Development
```bash
bun run dev              # Run all apps (web + mobile) in parallel
bun run dev:web         # Run only web app
bun run dev:mobile      # Run only mobile app
```

### Building & Type Checking
```bash
bun run build           # Build all packages (Turborepo)
bun run typecheck       # TypeScript type checking
```

### Linting & Formatting
```bash
bun run lint            # Run ESLint
bun run lint:fix        # Fix ESLint issues
bun run format          # Check Prettier formatting
bun run format:fix      # Fix formatting
bun run lint:ws         # Check workspace dependencies (Sherif)
```

### Testing
```bash
bun run test            # Run tests once
bun run test:watch      # Run tests in watch mode
```

### Versioning
```bash
bun run changeset       # Create a changeset for version bumps
```

## Architecture

**Monorepo Structure (Turborepo + Bun):**
- `packages/convex/` - Backend (Convex serverless functions + database)
- `packages/shared/` - Shared types, Zod validators, constants
- `packages/better-auth/` - Authentication config and clients
- `tooling/` - Shared ESLint, TypeScript, Prettier configs
- `apps/web/` - Next.js 16 web app (planned)
- `apps/mobile/` - Expo SDK 54 mobile app (planned)

**Tech Stack:**
- Runtime: Bun 1.3.7+, Node.js 22+
- Backend: Convex (database + serverless functions)
- Auth: Better Auth with Convex adapter
- Validation: Zod schemas (shared) + Convex validators (database)
- External APIs: OpenAI (AI), SerpAPI (search), Resend (email)

**Database Tables:** `users`, `icps`, `leads`, `preCallReports`, `emails`, `searchJobs`

## Convex Patterns

Use the correct function type:
- **Query**: Read-only operations (`convex/*/get.ts`, `convex/*/list.ts`)
- **Mutation**: Write operations (`convex/*/create.ts`, `convex/*/update.ts`)
- **Action**: Async/external API calls (`searchLeads`, `generateReport`)

All functions require `userId` authorization check:
```typescript
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("Unauthorized");
```

## Package Imports

```typescript
// Shared types and validators
import type { User, ICP, Lead } from "@noturno/shared/types";
import { createICPSchema } from "@noturno/shared/validators";

// Better Auth
import { auth } from "@noturno/better-auth/server";
import { useAuth } from "@noturno/better-auth/client";
```

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/) with scopes:
- Scopes: `web`, `mobile`, `convex`, `shared`, `auth`, `deps`, `tooling`, `docs`
- Example: `feat(convex): add lead search action`

## Code Review

CodeRabbit is installed for code review. Review uncommitted changes:
```bash
coderabbit --prompt-only -t uncommitted
```
Limit to 3 reviews per change set.
