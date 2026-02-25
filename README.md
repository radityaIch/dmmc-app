# DMMC App (Denpasar Maimai Community)

Web app for DMMC community activities: event hub, song library, score import tools, and tournament utilities.

## Features

- Homepage with community info, arcade locations, and upcoming meetups.
- Events page with card + calendar view.
- Songs page (library + random sheet + ban/pick flow).
- Song filters: search, category, chart type, region, sheet version, level range.
- Song caching in IndexedDB (Dexie) with manual sync button.
- Tournament bracket page (single-elimination workflow, local persistence).
- Bookmarklets page and score import flow for DX NET integration.
- PWA support (installable, manifest + service worker setup).

## Get Started

1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

3. Open:

`http://localhost:3000`

## Environment You Need

- Node.js 20+
- npm 10+ (or pnpm/yarn if you prefer)
- Modern browser (Chrome/Edge/Firefox) for IndexedDB + PWA testing

## Environment Variables

Create `.env.local` at project root:

```bash
NEXT_PUBLIC_MY_SCORE_URL=http://localhost:3000/my-score
```

Notes:
- `NEXT_PUBLIC_MY_SCORE_URL` is used by bookmarklet pages as receiver target.
- If omitted, app falls back to `http://localhost:3000/my-score`.

## Beta Status (Still Beta)

This app is still **beta**.

Why:
- Bookmarklets are not fully completed yet.
- Tournament bracket flow still has unfinished/buggy areas.

Bookmarklet reference you can continue from:
- https://myjian.github.io/mai-tools/

Special thanks:
- Ming-yuen Jien — https://github.com/myjian/

## Next Plan

- Finish bookmarklet implementation.
- Make upcoming events dynamically manageable (CMS-backed).
- Finish and stabilize buggy tournament features.

## Contributing

This project uses **Git convention + Semantic Versioning** with Husky hooks.

- Please **fork this repository** first if you want to contribute.
- If you have an idea or suggestion, please open it in **GitHub Issues**.

### Commit Convention (Conventional Commits)

- Commit messages are validated by `commitlint` via Husky `commit-msg` hook.
- Use formats like:
	- `feat: add region filter`
	- `fix: reset draft clears local storage`
	- `docs: update contribution guide`
	- `chore: upgrade dependencies`

Optional scope example:
- `feat(songs): add sheet version filter`

### Husky Hooks

- `pre-commit`: runs `npm run lint`
- `commit-msg`: runs commitlint validation

If hooks are not active after fresh clone:

```bash
npm install
npm run prepare
```

### Helper Commands

- Interactive conventional commit prompt:

```bash
npm run commit
```

- Manual lint for recent commit range:

```bash
npm run commitlint
```

- Lint a specific commit message file (same mode used by hook):

```bash
npm run commitlint:edit -- .git/COMMIT_EDITMSG
```

### Semantic Versioning & Release

Versioning follows SemVer (`major.minor.patch`) using `standard-version`.

- Automatic bump by commit history:

```bash
npm run release
```

- Force specific bump type:

```bash
npm run release:patch
npm run release:minor
npm run release:major
```

`standard-version` updates version/changelog and creates a release commit + git tag.

