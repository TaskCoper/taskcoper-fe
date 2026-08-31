# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager: **Yarn 4** (see `.yarnrc.yml`, `.yarn/`). Use `yarn`, not `npm`.

- `yarn dev` - Vite dev server on port 3000 (`vite.config.ts` proxies `/api` → `https://taskcoper-api.bentran1vn.com` with `cookieDomainRewrite: 'localhost'` so auth cookies work locally).
- `yarn dev:prod` - dev server with production env vars.
- `yarn build` - `tsc -b` (project references) then `vite build`.
- `yarn build:dev` - type-check + build with `--mode development`.
- `yarn lint` - ESLint (`eslint .`).
- `yarn check` - **run before opening a PR**; runs `yarn lint && tsc -b`.
- `yarn format` - Prettier over all `*.ts` / `*.tsx`.
- `yarn preview` - serve `dist/` locally.
- `yarn docker:build` - rebuild and start `.docker/docker-compose.yml`.

No test runner is configured; AGENTS.md prescribes manual verification of affected flows in `yarn dev` plus `yarn check` + `yarn build`.

Env vars (in `.env.development` / `.env.production`, read in `src/shared/config.ts`): `VITE_API_BASE_URL`, `VITE_FILE_BASE_URL`, `VITE_APP_BASE_URL`.

## Architecture

### Feature-first layout

`src/features/<domain>/` is the unit of organization. A typical feature exposes:

- `services.ts` - a singleton class instance that wraps `api` (from `@/lib/axios`) and returns typed `BaseResponse<T>` / `BasePaginationResponse<T>`.
- `hooks/` - one file per query/mutation (`use-get-*.ts`, `use-create-*.ts`, …) wrapping React Query. Each query key comes from the centralized `queryKeys` map in `src/lib/query-keys.ts` - when you add a new query, register its key there so invalidation across hooks stays consistent.
- `types.ts`, `validations.ts` (Zod + `@hookform/resolvers`), `components/`, sometimes nested submodules (e.g. `projects/tasks/{core,attachments,comments,labels,members,subtasks}`).

Cross-cutting code lives in `src/components/` (shared UI; `components/ui/` is shadcn/ui new-york style - see `components.json`), `src/hooks/`, `src/lib/`, `src/shared/`, `src/services/`. Use the `@/*` alias (configured in both `tsconfig.json` and `vite.config.ts`) for any import from `src`.

### Routing & layout-based guards

`src/main.tsx` mounts a single `createBrowserRouter` whose children are the role-segmented route arrays in `src/routes/`: `publicRoutes`, `userRoutes`, `orgAdminRoutes`, `adminRoutes`. Pages under `src/pages/` are mostly `lazy()`-imported in those route files.

Access control is built by **nesting layout routes**, not by per-page checks:

1. `AuthGuardLayout` (`requiresAuth`) - calls `useGetMe` and either renders, redirects to `/sign-in`, or routes to `/verify-email` when `isVerificationRequired`.
2. `RoleGuardLayout` - narrows to `allowedRoles` (`'user' | 'orgAdmin' | 'superAdmin'`) and optionally `allowedUserRoles` (e.g. `['Mentor']`); falls back to `getRoleHomePath(...)`.
3. `ProjectPermissionGuardLayout` - for project-scoped routes only; calls `useGetMyProjectPermissions` and gates by `sectionKey` (`TASKS`, `REVENUE`, `OVERVIEW`, `CALENDAR`, `PERFORMANCE`, `STORAGE`, `SETTINGS`) + optional `action`/`extensionKey`. The `handle: { sidebarItem: ... }` on these routes is consumed by the project sidebar to highlight the active section.

When adding a new authenticated route, wrap it in the matching guard layouts - don’t re-implement the check inside the page.

### Auth + axios

`src/lib/axios.ts` is the single HTTP client.

- `withCredentials: true` - auth is **cookie-based** (httpOnly access + refresh). The Zustand `auth.store.ts` persists tokens for JWT decoding/role checks, but the server uses the cookie.
- Request interceptor injects `Accept-Language` (from i18next) and `X-Timezone`.
- Response interceptor handles 401 `ExpiredAccessToken` / `MissingAccessToken` by calling `POST /v1/users/refresh_token` once and queuing concurrent failures via `refreshSubscribers`. A failed refresh with `messageCode === 'InvalidRefreshToken'` calls `clearAllUserPreferences()` and `window.location.replace('/sign-in')` **only when not on a public route** (see `PUBLIC_ROUTE_PATHS`) - keep this list in sync if you add new public routes, otherwise public pages will hard-reload-loop on a failed background refresh.
- Backend responses are always wrapped in `BaseResponse<T>` / `BasePaginationResponse<T>` (`{ isSuccess, isFailure, value, error }`). Service methods unwrap `data.value` for single-item responses but return the whole `data` for paginated ones (so callers can read `items`, `totalCount`, `hasNextPage`).

### React Query defaults

`ReactQueryProvider` (`src/lib/react-query.tsx`) sets project-wide defaults you should rely on rather than overriding:

- `throwOnError` swallows 401s with `Expired|Invalid|MissingAccessToken` (the interceptor + guards handle them).
- `retry` is disabled for 400/401/403/404/500; otherwise one retry after 3s.
- `staleTime: 5 minutes`, `refetchOnWindowFocus: false`.
- The global `defaultError` type is augmented to `AxiosError<ErrorResponse>` - typed mutations can read `error.response?.data.messageCode` directly.

### State

- **Server state** → React Query, keyed via `src/lib/query-keys.ts`.
- **URL/query state** → `nuqs` (`NuqsAdapter` mounted at the app root); prefer this for filters, pagination, tab selection.
- **Client/global state** → small Zustand stores in `src/lib/zustand/` (`auth`, `confirm`, `task-ui`, `mentor-widget`, `last-active-milestones`). Imperative dialogs use `confirm.store.ts` via the singleton `<ConfirmDialog />` in `AppLayout`.

### Other conventions worth knowing

- **Drag & drop**: `@dnd-kit/*`. `hasDraggableData()` in `src/shared/utils.ts` is the type-guard for the union of drag payloads (`MilestoneColumn`, `TaskCard`, `MilestoneTab`, `ParentSubtask`, `ChildSubtask`).
- **Rich text**: TipTap 3 (`@tiptap/*`); shared editor primitives live in `src/components/tiptap-*`.
- **i18n**: i18next with browser language detection; locales under `src/lib/i18n/locales/`. Page titles set via the inline `PageWrapper` in each route file using `t('pageTitle.*')`.
- **Forms**: `react-hook-form` + Zod via `@hookform/resolvers`; schemas live in each feature's `validations.ts`.
- **Bundle splitting**: `vite.config.ts` defines `manualChunks` (`react-vendor`, `radix-ui`, `dnd-kit`, `react-query`, `form-libs`, `ui-utils`, `i18n`, `utils`, `pdf`, `charts`, `animations`) - when adding a heavyweight dep, consider whether it belongs in an existing group.

## Style (from AGENTS.md / Prettier / ESLint)

- Prettier: 2 spaces, single quotes (incl. JSX), **no semicolons**, width 120, **no trailing commas**.
- Files: **kebab-case** (`project-member.page.tsx`, `use-get-projects.ts`). Components/types: PascalCase. Hooks/helpers: `use…` / camelCase.
- ESLint extends `typescript-eslint`, React Hooks, React Refresh, and `@tanstack/eslint-plugin-query` - pay attention to the query-plugin rules when writing new hooks.
- Commits: Conventional Commits with emoji tag, e.g. `feat: :sparkles: …`, `fix: :ambulance: …`, `refactor: :lipstick: …`.

See `AGENTS.md` for the full contributor guide.
