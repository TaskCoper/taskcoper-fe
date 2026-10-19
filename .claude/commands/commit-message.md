---
description: Generate a buildx commit message (title + impact bullets) from the diff
argument-hint: [staged|all]
---

Generate a commit message for this repository.

**Never commit.** Do not run `git commit`, `git add`, or any other git write command. Only read state (`git diff`, `git status`, `git branch --show-current`) and print the message as text so it can be copied into the commit input manually.

## Diff source

Argument: `$ARGUMENTS`

- `staged` (default when empty) → inspect `git diff --staged`. If it is empty, fall back to `git diff HEAD` and note you used all changes instead.
- `all` → inspect `git diff HEAD` (staged + unstaged).

Run the corresponding `git diff` (and `git status` if the diff alone doesn't make the change clear) before writing anything.

## Branch issue id (always check this)

Before drafting the title, run `git branch --show-current` and match the result against `^[a-zA-Z]+/(\d+)-`.

- Match → remember `<issue_id>` (the captured number). It gets appended to the title later.
- No match → no issue id for this commit. Do not guess one.

## Title

1. Classify the change by inspecting the diff. Pick the ONE dominant type:
   - `feat` ✨ → new user-facing capability/screen/flow
   - `fix` 🐛 → corrects broken behavior
   - `refactor` ♻️ → restructure, behavior unchanged
   - `perf` ⚡️ → performance improvement
   - `style` 💄 → visual/UI/formatting only, no logic change
   - `i18n` 🌐 → adds/changes `en.json` / `vi.json` translations
   - `docs` 📝 → `AGENTS.md`/`CLAUDE.md`/docs/comments only
   - `test` ✅ → tests only
   - `chore` 🔧 → deps, Expo/app config, EAS/CI, tooling, housekeeping
     If the diff spans multiple types, choose the highest-impact one and mention the rest as bullets.

2. Derive the scope from the primary feature/area touched. It MUST be one of these allowed scopes only (matches `src/features/*`, `src/app/`, and shared infra in this repo):

   ```
   app, articles, auth, chat, checkout, ci, config, consultation,
   contractors, dashboard, deps, i18n, notifications, onboarding,
   plans, profile, project, settings, shared, supervision, ui
   ```

   - Pick the single best match.
   - `home`/dashboard-widget changes → `dashboard` (matches existing history, e.g. `feat(dashboard)`).
   - `contractors`/`supervision` estimate & project-brief flows → `project` unless the change is narrowly scoped to just `contractors/` or `supervision/`, in which case use that scope directly.
   - Root layout, providers, navigator, error boundary, native intent → `app`.
   - `src/lib/`, `src/components/` (non-`ui/`), cross-feature utilities → `shared`.
   - If truly nothing fits, omit the scope entirely - never invent one outside this list.
   - Never duplicate the type as scope (no `i18n(i18n)`); for an `i18n` type, use the feature area whose copy changed as the scope.

3. Format: `<type>(<scope>): <emoji> <imperative description>`

4. Rules:
   - Imperative present tense ("add", not "added"/"adds").
   - Lowercase description, no trailing period.
   - The `<type>(<scope>): <emoji> <description>` part ≤ 50 characters. If too long, drop the scope first, then shorten the description - never drop the type or emoji.
   - Use the real unicode emoji character (✨ 🐛 ♻️ ⚡️ 💄 🌐 📝 ✅ 🔧), not a `:gitmoji:` text code.

5. Issue id suffix - if the "Branch issue id" check above found an id, append ` (#<issue_id>)` to the very end of the title line (after the description), e.g. `feat(auth): ✨ add google sign-in (#123)`. This suffix is exempt from the 50-character budget above - it's a reference footer, not part of the description. If no id was found, omit the suffix entirely.

## Impact bullets

4–6 lines, one line each:

- Describe the most important effects: behavior, logic, i18n, auth/session, React Query/mutation changes, removals, integrations.
- Concise, present tense, prioritize user-visible or high-impact changes.
- Keep each bullet to one clear sentence, roughly 8–14 words (~50–90 characters). Split a bullet in two rather than writing one long compound sentence.
- Capitalize the first letter of each bullet.
- Do NOT include file names, paths, or file tags.
- If types/files were removed, say "Remove obsolete types" (no paths).

## Output

Output ONLY this structure, nothing else:

```
Commit message: <short message>
Impact bullets:
- <bullet 1>
- <bullet 2>
- …
```
