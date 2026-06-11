# Project Conventions

## Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Backend**: Convex (real-time database, serverless functions)
- **Auth**: Better Auth via `@convex-dev/better-auth`
- **Styling**: Tailwind CSS 4 with `tw-animate-css`
- **Animation**: Framer Motion / Motion, GSAP, anime.js
- **Language**: TypeScript (strict mode)
- **Package manager**: pnpm

## Commands

- `pnpm dev` — start dev server
- `pnpm build` — production build (includes bookmarklet build)
- `pnpm lint` — run ESLint
- No test runner configured

## Code Style

- Path alias: `@/*` maps to project root
- Use `"use client"` directive only when needed (event handlers, hooks, browser APIs)
- Prefer Server Components by default
- Components live in `components/` (shared) or `app/<route>/components/` (route-specific)
- Convex functions live in `convex/` with schema in `convex/schema.ts`
- API routes live in `app/api/`

## Commits

- Conventional Commits enforced via commitlint + commitizen
- Format: `type(scope): description` (e.g. `feat(auth): add login page`)
- Types: feat, fix, docs, style, refactor, perf, test, chore, revert
- Releases managed with standard-version

## Key Directories

- `app/` — Next.js App Router pages and API routes
- `convex/` — Convex schema, functions, and HTTP handlers
- `components/` — shared UI components
- `hooks/` — shared React hooks
- `lib/` — shared utilities
- `public/` — static assets
- `scripts/` — build scripts
- `bookmarklets-src/` — bookmarklet source code
