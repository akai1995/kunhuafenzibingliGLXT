# AGENTS.md

Vue 3 admin template (Art Design Pro) customized for 昆华分子病理 GLXT. Single-page app, no monorepo.

## Tech Stack

Vue 3 + TypeScript + Vite 7 + Element Plus + Tailwind CSS 4 + Pinia + Vue Router 4

Package manager: **pnpm** (>=8.8.0). Node >=20.19.0.

## Commands

```bash
pnpm install              # install deps (pnpm-lock.yaml present)
pnpm install --ignore-scripts  # fallback if install fails
pnpm dev                  # dev server on port 3006
pnpm build                # vue-tsc --noEmit && vite build
pnpm lint                 # eslint
pnpm fix                  # eslint --fix
pnpm lint:prettier        # prettier --write
pnpm lint:stylelint       # stylelint fix
pnpm clean:dev            # remove demo data, get a clean base project
pnpm commit               # interactive commit (cz-git)
```

No test framework is configured. No CI workflow files found.

## Pre-commit / Linting

Husky pre-commit runs `pnpm run lint:lint-staged` (lint-staged). Commitlint enforces conventional commits on `commit-msg`.

**Order matters**: `pnpm fix` → `pnpm lint:prettier` → `pnpm lint:stylelint` (if touching CSS/SCSS/Vue).

## Code Style (enforced by ESLint + Prettier)

- Single quotes, **no semicolons**, 100 char line width
- Vue SFC: `<script>` and `<style>` blocks are indented (`vueIndentScriptAndStyle: true`)
- Trailing commas: none
- ESLint config: `eslint.config.mjs` (flat config, not .eslintrc)

## Path Aliases

Defined in both `vite.config.ts` and `tsconfig.json`:

| Alias | Target |
|-------|--------|
| `@` | `src` |
| `@views` | `src/views` |
| `@imgs` | `src/assets/images` |
| `@icons` | `src/assets/icons` |
| `@utils` | `src/utils` |
| `@stores` | `src/store` |
| `@styles` | `src/assets/styles` |

## Auto-imports

`unplugin-auto-import` auto-imports Vue, Vue Router, Pinia, and VueUse APIs — no manual imports needed for `ref`, `computed`, `useRoute`, `useRouter`, `defineStore`, etc.

`unplugin-vue-components` auto-imports Element Plus components. No need to manually register them.

Generated type declarations live at `src/types/import/auto-imports.d.ts` and `src/types/import/components.d.ts`.

## SCSS Global Mixins

Two SCSS files are prepended to every `.scss`/`.vue` style block via Vite config:
- `@styles/core/el-light.scss`
- `@styles/core/mixin.scss`

These are available globally — no import needed.

## Environment Variables

Loaded from `.env` (shared) + `.env.development` / `.env.production`.

Key variables:
- `VITE_PORT` — dev server port (default 3006)
- `VITE_API_URL` — API base path (dev: `/`, prod: full URL)
- `VITE_API_PROXY_URL` — dev proxy target
- `VITE_ACCESS_MODE` — `frontend` or `backend` permission mode
- `VITE_BASE_URL` — base path for deployment

## Project Structure

```
src/
  api/          # HTTP request modules (auth, system-manage)
  assets/       # styles, images, icons
  components/   # core/ (reusable UI) and business/ (domain-specific)
  config/       # app settings, fast-enter config
  directives/   # global Vue directives
  hooks/        # composables (useTable, useTheme, useChart, useAuth, etc.)
  locales/      # i18n (zh.json, en.json)
  mock/         # mock data and API interceptors
  router/       # modules/ (route definitions), guards/, core/
  store/        # Pinia stores (menu, setting, table, user, worktab)
  types/        # TypeScript type definitions
  utils/        # helpers (http, form, table, storage, router, etc.)
  views/        # page components (dashboard, system, auth, etc.)
  main.ts       # app entry point
```

## Commit Convention

Conventional commits enforced by commitlint. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`, `chore`, `wip`.

## Gotchas

- `pnpm build` runs type-checking (`vue-tsc --noEmit`) before Vite build — fix type errors before building
- Production build drops `console` and `debugger` via terser
- Vite proxy only forwards `/api` prefix
- The `clean:dev` script is destructive — it rewrites route modules, language files, and deletes demo assets. Only run on a fresh clone when starting real development
- `.auto-import.json` is read by ESLint config at lint time — regenerate with `pnpm dev` if globals seem stale
