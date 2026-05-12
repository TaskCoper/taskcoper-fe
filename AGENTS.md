# Repository Guidelines

## Project Structure & Module Organization
This is a Vite + React 19 + TypeScript frontend. Main code lives in `src/` and is organized by domain:
- `src/features/`: feature-first modules (for example `projects`, `mentor-packages`, `users`) with `components`, `hooks`, `services`, `types`, and `validations`.
- `src/components/`: shared UI building blocks.
- `src/pages/`, `src/layouts/`, `src/routes/`: route pages and layout composition.
- `src/lib/`, `src/shared/`, `src/hooks/`: cross-cutting utilities, app libraries, and reusable hooks.
- `public/`: static assets. Build output goes to `dist/`.

Use the path alias `@/*` (configured in `tsconfig.json`) for imports from `src`.

## Build, Test, and Development Commands
- `yarn dev`: start local Vite dev server.
- `yarn dev:prod`: run dev server with production mode variables.
- `yarn build`: type-check (`tsc -b`) and build production bundle.
- `yarn build:dev`: type-check and build with development mode.
- `yarn preview`: preview the built app locally.
- `yarn lint`: run ESLint across the repo.
- `yarn check`: run lint + TypeScript project checks (recommended before PR).
- `yarn format`: run Prettier on `*.ts` and `*.tsx`.
- `yarn docker:build`: build and run Docker stack via `.docker/docker-compose.yml`.

## Coding Style & Naming Conventions
Formatting is enforced by Prettier: 2 spaces, single quotes (including JSX), no semicolons, max line width 120, trailing commas disabled.  
ESLint uses TypeScript, React Hooks, React Refresh, and TanStack Query rules.

Follow existing naming patterns:
- Files: kebab-case (for example `project-member.page.tsx`, `use-get-projects.ts`).
- React components/types: PascalCase.
- Hooks and helpers: `use...` / camelCase.

## Testing Guidelines
No dedicated test runner or `yarn test` script is currently configured. For every change:
- Run `yarn check` and `yarn build`.
- Validate affected flows manually in `yarn dev`.
- If adding tests, use `*.test.ts`/`*.test.tsx` naming and colocate with the related feature.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commit prefixes with emoji tags, e.g.:
- `feat: :sparkles: add infinite domain loading...`
- `refactor: :lipstick: clean code`

Keep commits focused and imperative.  
PRs should include: clear scope/impact summary, linked issue(s), screenshots or short recordings for UI changes, and confirmation that `yarn check` and `yarn build` pass.
