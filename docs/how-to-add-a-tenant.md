# How to add a tenant

Two-step onboarding. **No edits** to the shared loader (`src/lib/i18n/load-tenant-namespace.ts`), API client (`src/lib/axios.ts`), sidebar (`src/components/sidebar/users/user-workspace-sidebar.tsx`), or routes file (`src/routes/user.route.tsx`).

---

## Step 1 — Register the tenant config

1. Create a folder under `src/tenants/<slug>/` for your tenant.
2. Inside it, build a `Partial<TenantConfig>` object. Optional fields:
   - `modules`, `custom`, `defaultLanding`, `logoUrl` — feature flags + landing path
   - `i18nNamespace`, `locales` — tenant strings (Step 2)
   - `navMain` — sidebar sections appended after the global nav
   - `workspaceRoutes` — pages mounted inside the user-workspace layout
3. Register the tenant by its `organizationId` in `src/lib/feature-flags/tenants.config.ts`.

### Minimal example — `src/tenants/acme/config.ts`

```ts
import type { TenantConfig } from '@/lib/feature-flags/types'

export const ACME_ORG_ID = 'your-org-uuid-here'

export const acmeConfig: Partial<TenantConfig> = {
  modules: {
    home: false,
    taskManagement: true,
    mentorNetworking: false,
    meetings: false,
    news: false
  },
  custom: {
    orderManagement: true
  },
  defaultLanding: '/projects',
  logoUrl: '/projects',
  i18nNamespace: 'acme',
  locales: {
    en: () => import('./locales/en.json'),
    vi: () => import('./locales/vi.json')
  }
}
```

### Register it — `src/lib/feature-flags/tenants.config.ts`

```ts
import { ACME_ORG_ID, acmeConfig } from '@/tenants/acme/config'
import type { TenantConfig } from './types'

export const TENANT_CONFIGS: Record<string, Partial<TenantConfig>> = {
  [ACME_ORG_ID]: acmeConfig
}
```

That's the only edit outside `src/tenants/<slug>/`.

---

## Step 2 — Add the locale bundle

Create `src/tenants/<slug>/locales/en.json` and `vi.json`. Keys nest like the base bundle; matching paths override base keys, missing paths fall back to base.

```json
{
  "orders": {
    "listComingSoon": "Orders — Coming Soon"
  }
}
```

Components inside the tenant call `useTenantTranslation()` (from `@/lib/i18n/use-tenant-translation`) to read these. A non-tenant user pays zero cost — the bundle is `import()`-ed only after `useGetMe()` returns an org id that matches a tenant config.

Tenant strings are excluded from base `i18n:extract`, `i18n:check`, `i18n:lint`, and `i18n:types` (see `i18next.config.js`). Maintain `src/tenants/<slug>/locales/*.json` by hand.

---

## Optional — tenant nav + routes

If the tenant has its own pages, add `navMain` and `workspaceRoutes` to the config. Both are read off `TENANT_CONFIGS` at module load — no edits to shared files.

### `src/tenants/acme/nav-items.ts`

```ts
import type { TenantNavMainItem } from '@/lib/feature-flags'
import { PackageIcon } from 'lucide-react'

export const acmeNavMain: TenantNavMainItem[] = [
  {
    title: 'Orders',
    url: '/acme/orders',
    icon: PackageIcon,
    feature: 'custom.orderManagement',
    items: [{ title: 'List', url: '/acme/orders' }]
  }
]
```

### `src/tenants/acme/routes.tsx`

```tsx
import { FeatureFlagGuardLayout } from '@/lib/feature-flags'
import { lazy } from 'react'
import { Outlet, type RouteObject } from 'react-router'

const OrdersListPage = lazy(() => import('./pages/orders-list.page'))

export const acmeWorkspaceRoutes: RouteObject[] = [
  {
    path: 'acme',
    element: <Outlet />,
    children: [
      {
        element: <FeatureFlagGuardLayout requires='custom.orderManagement' />,
        children: [{ path: 'orders', element: <OrdersListPage /> }]
      }
    ]
  }
]
```

### Wire them into the config

```ts
import { acmeNavMain } from './nav-items'
import { acmeWorkspaceRoutes } from './routes'

export const acmeConfig: Partial<TenantConfig> = {
  // ... fields from Step 1 ...
  navMain: acmeNavMain,
  workspaceRoutes: acmeWorkspaceRoutes
}
```

---

## Optional — separate backend

If the tenant calls a different API host:

1. Add the env var to `.env.development` and `.env.production`, e.g. `VITE_ACME_API_BASE_URL`.
2. In `src/tenants/acme/lib/api.ts`, build a client with the shared factory:

   ```ts
   import { createApiClient } from '@/lib/axios'

   export const acmeApi = createApiClient(import.meta.env.VITE_ACME_API_BASE_URL)
   ```

3. For local dev cookies to work, add a proxy entry in `vite.config.ts`:

   ```ts
   '/acme-api': {
     target: 'https://acme-api.example.com',
     changeOrigin: true,
     rewrite: (path) => path.replace(/^\/acme-api/, ''),
     cookieDomainRewrite: 'localhost'
   }
   ```

`createApiClient` handles token refresh, language headers, and timezone — the tenant client gets that for free.

---

## Verifying

After adding a tenant:

```bash
yarn check        # lint + tsc
yarn build        # production bundle
yarn dev          # smoke test with a user in the tenant's org
```

Tenant JSON is excluded from `yarn i18n:verify` — it won't complain about untranslated tenant strings.
