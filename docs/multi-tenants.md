# Hướng dẫn Multi-tenant Feature Flag

> Tài liệu cho thành viên mới: giải thích **vì sao có**, **các file làm gì**, **luồng chạy thế nào**, và **cách thêm/sửa** cho hệ thống feature flag theo tenant của TaskCoper.

---

## 1. Bối cảnh

TaskCoper đang chuyển từ sản phẩm SaaS chung sang mô hình **B2B đa khách hàng**. Mỗi khách hàng B2B (tenant):

- Chỉ được dùng một **subset** trong các module sản phẩm (vd: chỉ Task Management).
- Có thể có thêm vài **tính năng tùy chỉnh** riêng cho họ.
- Vẫn dùng **chung một codebase, chung một build pipeline** — không fork repo, không build riêng.

**Outcome:** một lớp feature flag có kiểu (typed), nguồn sự thật là `tenants.config.ts`. Mặc định = tất cả flag bật → khách hàng cũ không bị ảnh hưởng. Thêm khách hàng mới = thêm một entry vào registry. Có thể chuyển sang backend trong tương lai mà không phải sửa nơi khác.

**Cách định danh tenant:** dùng `me.organizationId` từ `useGetMe()` (có sẵn trong JWT + React Query cache). Sau khi user đăng nhập, tra cứu trong `TENANT_CONFIGS` để biết tenant này được bật những gì.

---

## 2. Các module hiện tại

| Module key         | Phạm vi                                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `home`             | Trang public `/` (HomePage marketing)                                                                                        |
| `taskManagement`   | Toàn bộ feature `projects` (project, milestone, task, label, member, role, analytics, charts)                                |
| `mentorNetworking` | Mentor packages, vouchers, applications, requests, purchases, transactions, network                                          |
| `meetings`         | `/calendar` toàn cục + calendar/schedules (Meetings TRONG project vẫn theo permission backend, không bị flag này khoá riêng) |
| `news`             | `/news`                                                                                                                      |

> Luôn bật (không gắn flag): `auth`, `users`, `notifications`, `domains`, `verify-email`, profile, settings.

---

## 3. Cấu trúc thư mục

```
src/lib/feature-flags/
├── types.ts                    # TenantConfig, ModuleKey, FeatureKey
├── default.config.ts           # Mặc định = TẤT CẢ flag = true
├── tenants.config.ts           # Registry: organizationId → override config
├── resolve-tenant-config.ts    # Hàm merge default + override
├── use-feature-flags.ts        # Hooks: useTenantConfig, useFeature, useRoleHomePath, isFeatureEnabled, resolveFeatureCheck
├── use-filtered-nav-items.ts   # Hook lọc nav items dùng chung cho top-nav + sidebar
├── redirect-loop.ts            # Helper phát hiện loop redirect
└── index.ts                    # Re-export gọn

src/layouts/
├── feature-flag-guard.layout.tsx   # FeatureFlagGuardLayout + TenantLandingRedirect + TenantConfigLoading
├── auth-guard.layout.tsx           # AuthGuard (đã loop-guarded)
└── role-guard.layout.tsx           # RoleGuard (đã loop-guarded)
```

---

## 4. Ý nghĩa từng file

### 4.1 `types.ts` — Khung dữ liệu

```ts
export type ModuleKey = 'home' | 'taskManagement' | 'mentorNetworking' | 'meetings' | 'news'

export type TenantConfig = {
  modules: Record<ModuleKey, boolean> // Bật/tắt từng module
  custom: Record<string, boolean> // Cờ tùy chỉnh per-tenant
  defaultLanding: string // Đích redirect khi route bị chặn
  logoUrl: string // Logo header link tới đâu
}

export type FeatureKey = `module.${ModuleKey}` | `custom.${string}`
```

- `FeatureKey` là **dot-path** thống nhất. Ví dụ: `'module.taskManagement'`, `'custom.quarterlyReport'`.
- `custom` để mở (`Record<string, boolean>`) — thêm cờ không cần sửa type.

### 4.2 `default.config.ts` — Khi không match tenant nào

```ts
export const DEFAULT_TENANT_CONFIG: TenantConfig = {
  modules: { home: true, taskManagement: true, mentorNetworking: true, meetings: true, news: true },
  custom: {},
  defaultLanding: '/projects',
  logoUrl: '/'
}
```

**Áp dụng khi:**

- User chưa đăng nhập (`organizationId` là `null`).
- Hoặc `organizationId` không có entry trong `TENANT_CONFIGS` (khách hàng cũ, dev account, …).

**Mặc định = tất cả flag bật** → không khách hàng nào bị thay đổi hành vi cho đến khi thêm entry vào registry.

### 4.3 `tenants.config.ts` — Registry per-tenant

```ts
export const TENANT_CONFIGS: Record<string, Partial<TenantConfig>> = {
  'b7438510-a0f7-4bea-b652-b787c01294e5': {
    // organizationId của khách hàng
    modules: {
      home: false,
      taskManagement: true,
      mentorNetworking: false,
      meetings: false,
      news: false
    },
    custom: {
      orderManagement: true,
      recruitmentPortal: true
    },
    defaultLanding: '/projects',
    logoUrl: '/projects'
  }
}
```

- Khóa là `organizationId` (UUID).
- Giá trị là `Partial<TenantConfig>` — chỉ ghi đè field nào khác default.
- **File này là nguồn sự thật duy nhất** cho cấu hình per-tenant. Đổi config = sửa file này, KHÔNG sửa nơi khác.

### 4.4 `resolve-tenant-config.ts` — Logic merge

```ts
export function resolveTenantConfig(organizationId: string | null | undefined): TenantConfig {
  if (!organizationId) return DEFAULT_TENANT_CONFIG
  const override = TENANT_CONFIGS[organizationId]
  if (!override) return DEFAULT_TENANT_CONFIG
  return {
    modules: { ...DEFAULT_TENANT_CONFIG.modules, ...override.modules },
    custom: { ...DEFAULT_TENANT_CONFIG.custom, ...override.custom },
    defaultLanding: override.defaultLanding ?? DEFAULT_TENANT_CONFIG.defaultLanding,
    logoUrl: override.logoUrl ?? DEFAULT_TENANT_CONFIG.logoUrl
  }
}
```

Cho `organizationId`, trả về `TenantConfig` đã merge đầy đủ.

> **Migration tương lai:** khi backend muốn cầm flag, chỉ cần đổi thân hàm này thành React Query call `/v1/organization/{id}/feature-flags` — toàn bộ consumer (hook, guard, nav filter) giữ nguyên.

### 4.5 `use-feature-flags.ts` — Hooks và utilities

| Hàm / Hook                         | Mục đích                                                                          | Khi dùng                                              |
| ---------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `useTenantConfig()`                | Trả về `TenantConfig` đã resolve cho user hiện tại (dựa vào `useGetMe`)           | Khi cần đọc nhiều flag cùng lúc                       |
| `useFeature(key)`                  | Bool — feature đó có bật không                                                    | Trong component, check 1 flag                         |
| `useRoleHomePath()`                | Đích redirect post-auth (admin → role home cứng; user → `config.defaultLanding`)  | Trong guard `Navigate`                                |
| `resolveFeatureCheck(config, key)` | Hàm thuần (không phải hook) — check feature trong một config có sẵn               | Dùng trong `.filter()`, `useMemo`, callback           |
| `isFeatureEnabled(orgId, key)`     | Hàm thuần — check feature theo `orgId` trực tiếp (gọi `resolveTenantConfig` ngầm) | NGOÀI React (axios interceptor, zustand action, util) |

**Quy tắc:** trong component → ưu tiên `useFeature` hoặc `useTenantConfig`. Ngoài React → `isFeatureEnabled` / `resolveFeatureCheck`.

### 4.6 `use-filtered-nav-items.ts` — Lọc nav dùng chung

```ts
export type GuardedNavItem = {
  roles?: Role[]
  feature?: FeatureKey
}

export function useFilteredNavItems<T extends GuardedNavItem>(items: T[]): T[]
```

Hook lọc một mảng items theo `roles` (vai trò user) + `feature` (flag tenant). Dùng bởi cả:

- `src/components/sidebar/users/user-workspace-sidebar.tsx` (sidebar workspace)
- `src/layouts/user-default.layout.tsx` (top-nav header)

**Vì sao tách ra hook chung:** nếu để inline ở mỗi nơi, sửa luật visibility ở một bên mà quên bên kia → hai surface lệch nhau. Hook chung = một nơi sửa, hai nơi update đồng bộ.

### 4.7 `redirect-loop.ts` — Phát hiện loop

```ts
export function isRedirectLoop(currentPathname: string, target: string, source: string): boolean
```

Nếu `currentPathname === target`:

1. Log `console.error` với `source` để biết guard nào trip.
2. Trả `true` → caller render `null` thay vì `<Navigate>`.

Phòng trường hợp tenant config bị sai (vd `defaultLanding: '/projects'` mà `taskManagement: false`) gây loop redirect vô hạn → khoá trình duyệt.

### 4.8 `feature-flag-guard.layout.tsx` — Route guards

| Component                              | Vai trò                                                                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `FeatureFlagGuardLayout({ requires })` | Bọc nhóm route. Nếu module tắt → redirect về `defaultLanding`. Có loop guard.                                              |
| `TenantLandingRedirect`                | Component dùng cho catch-all `path: '*'` — redirect về `defaultLanding`. Có loop guard.                                    |
| `TenantConfigLoading` _(nội bộ)_       | Loading overlay full-screen (`fixed inset-0 z-1000 bg-background`) trong lúc `useGetMe` đang resolve — chặn flash content. |

### 4.9 `auth-guard.layout.tsx` & `role-guard.layout.tsx`

Vẫn giữ trách nhiệm gốc (auth check + role check) nhưng:

- Đích redirect post-auth dùng `useRoleHomePath()` (tenant-aware) thay vì `getRoleHomePath(...)` cứng.
- Có loop guard ở mọi nhánh `Navigate` đến tenant-derived path.

---

## 5. Luồng chạy (Flow)

### 5.1 Đường đi của một request

```
URL bất kỳ
│
├─ AppLayout (root)
│  ├─ AuthGuardLayout
│  │  ├─ useGetMe loading → render logo loading screen toàn màn hình
│  │  ├─ Unauth → Navigate → /sign-in
│  │  ├─ Cần verify email → Navigate → /verify-email
│  │  └─ OK → <Outlet />
│  │
│  └─ RoleGuardLayout(['user'])
│     ├─ Sai userType (admin trên route user) → Navigate → getRoleHomePath(userType)
│     ├─ Sai allowedUserRoles → Navigate → useRoleHomePath() (= config.defaultLanding)
│     └─ OK → <Outlet />
│        │
│        └─ UserDefaultLayout (header + top-nav)
│           │  • Top-nav filter bằng useFilteredNavItems
│           │  • Logo link = tenantConfig.logoUrl
│           │
│           └─ UserWorkspaceLayout (sidebar + content)
│              │  • Sidebar filter bằng useFilteredNavItems (cùng hook)
│              │
│              └─ FeatureFlagGuardLayout requires='module.X'
│                 ├─ useGetMe loading → TenantConfigLoading (overlay full-screen)
│                 ├─ Module bật → <Outlet />
│                 ├─ Module tắt + loop detected → console.error + null
│                 └─ Module tắt → Navigate → defaultLanding
│                    │
│                    └─ Page component (hoặc redirect tiếp nếu defaultLanding cũng bị chặn)
```

### 5.2 Ví dụ cụ thể — Khách hàng task-only truy cập `/news`

Tenant config: `news: false`, `taskManagement: true`, `defaultLanding: '/projects'`.

1. User gõ `/news` → AppLayout → AuthGuard (đã auth) → RoleGuard (đúng `user`) → UserDefaultLayout → UserWorkspaceLayout.
2. Route `/news` được bọc `FeatureFlagGuardLayout requires='module.news'`.
3. Guard chạy:
   - `useGetMe` đã resolve (cache warm) → bỏ qua loading.
   - `resolveFeatureCheck(config, 'module.news')` → `false`.
   - `isRedirectLoop('/news', '/projects', ...)` → `false` (path khác nhau).
   - Return `<Navigate to='/projects' replace />`.
4. Router chuyển sang `/projects`, render `ProjectsPage`. User KHÔNG kịp thấy `NewsPage`.

### 5.3 Cold reload — Tránh flash content

Khi user hard refresh tại URL bị chặn:

1. `useGetMe` đang fetch → chưa biết `organizationId` → config tạm là DEFAULT (mọi flag = true).
2. Nếu guard chạy ngay → flag = true → render trang bị cấm.
3. Khi `useGetMe` resolve, config flip → redirect — **flash content đã xảy ra rồi**.

**Cách khắc phục:** `FeatureFlagGuardLayout` kiểm tra `isGettingMe`. Nếu đang loading → render `TenantConfigLoading` (overlay full-screen) thay vì trả `<Outlet />`. Component con không mount, không có flash.

### 5.4 Loop guard — Misconfig safety net

Nếu tenant config sai (vd `defaultLanding` trỏ vào module đã tắt):

```
User visit anywhere → blocked → Navigate to /projects
↓
/projects → FeatureFlagGuardLayout(taskManagement) → tắt → Navigate to /projects → LOOP
```

`isRedirectLoop` chặn:

1. So sánh `location.pathname` với `target`.
2. Bằng nhau → `console.error('[feature-flags] Redirect loop detected — ...')` + return `true`.
3. Caller bail out, render `null`. Trình duyệt không bị treo.

Dev mở console thấy lỗi → biết phải sửa `tenants.config.ts`.

---

## 6. Cách thêm/sửa

### 6.1 Thêm tenant mới

1. Lấy `organizationId` (UUID) của khách hàng từ backend.
2. Mở `src/lib/feature-flags/tenants.config.ts`, thêm entry:
   ```ts
   '<ORG_ID_MỚI>': {
     modules: {
       home: false,
       taskManagement: true,
       mentorNetworking: false,
       meetings: false,
       news: false
     },
     custom: { quarterlyReport: true },
     defaultLanding: '/projects',
     logoUrl: '/projects'
   }
   ```
3. **Kiểm tra** (xem mục 7 phía dưới):
   - `defaultLanding` trong module BẬT, không phải role-restricted path.
   - `logoUrl` trong module BẬT.
4. Verify bằng `docs/feature-flags-test-cases.md` section A (regression) + section B (tenant mới).

### 6.2 Thêm module mới (ví dụ `chat`)

1. **types.ts** — thêm vào `ModuleKey`:
   ```ts
   export type ModuleKey = '...' | 'chat'
   ```
2. **default.config.ts** — thêm `chat: true` vào `modules`. (Default bật → tenant cũ không bị thay đổi.)
3. **Bọc route** trong `user.route.tsx`:
   ```tsx
   {
     element: <FeatureFlagGuardLayout requires='module.chat' />,
     children: [ { path: 'chat', element: <ChatPage /> } ]
   }
   ```
4. **Gắn vào nav** (sidebar / top-nav) — thêm `feature: 'module.chat'` vào item mới.
5. **Cập nhật QA doc** `docs/feature-flags-test-cases.md` — thêm row B cho `/chat`.

### 6.3 Thêm custom flag

1. Trong `tenants.config.ts`, thêm vào `custom`:
   ```ts
   custom: {
     weeklyReport: true
   }
   ```
2. Trong component cần gate:
   ```tsx
   const enabled = useFeature('custom.weeklyReport')
   if (!enabled) return null
   ```
3. Custom flag KHÔNG cần thêm vào `default.config.ts` (default = false nếu không có).

### 6.4 Gate một route

```tsx
{
  element: <FeatureFlagGuardLayout requires='module.X' />,
  children: [
    {
      element: <RoleGuardLayout allowedRoles={['user']} />,
      children: [{ path: '...', element: <Page /> }]
    }
  ]
}
```

**Quy tắc:** `FeatureFlagGuardLayout` đặt **NGOÀI** `RoleGuardLayout`. Module tắt thì dù role hợp lệ vẫn redirect.

### 6.5 Gate một component (ẩn/hiện)

```tsx
const enabled = useFeature('module.X') // hoặc 'custom.X'
if (!enabled) return null
return <MyWidget />
```

### 6.6 Gate một nav item

**Sidebar** (`src/components/sidebar/users/user-workspace-sidebar.tsx`):

```ts
const NAV_CONFIG: NavItemConfig[] = [{ titleKey: '...', url: '/x', icon: XIcon, feature: 'module.X' }]
```

**Top-nav header** (`src/layouts/user-default.layout.tsx`):

```ts
const navigations: TopNavItem[] = [
  { id: ..., label: '...', icon: ..., url: '/x', feature: 'module.X' }
]
```

`useFilteredNavItems` tự lọc — không phải đụng filter expression.

---

## 7. Cảnh báo TRƯỚC khi thay đổi config

Đọc kỹ trước khi sửa `tenants.config.ts`. Sai chỗ này → user gặp loop, blank page, hoặc flash content.

### 7.1 `defaultLanding`

- ✅ Phải nằm trong module ĐANG BẬT cho tenant này.
- ✅ Phải truy cập được bởi role thông thường:
  - Đừng chọn Mentor-only (`/packages`, `/vouchers`, `/calendar/schedules`) nếu user phổ thông là `User`.
  - Đừng chọn User-only (`/applications`) nếu tenant chủ yếu Mentor.
  - Đừng chọn admin-only (`/dashboard`, `/manage`).
- ❌ KHÔNG dùng `/sign-in`, `/sign-up`, `/verify-email`.
- ❌ Tránh deep project paths (`/projects/<id>/<section>`) — phụ thuộc per-project permission của từng user.
- 🟢 Default an toàn: `/projects` (với `taskManagement: true`), `/` (với `home: true`), `/users/<self>` (luôn có quyền).

### 7.2 `logoUrl`

- ✅ Cùng quy tắc với `defaultLanding`.
- ✅ Với `home: true` → thường để `/` (marketing home).
- ✅ Với `home: false` → để bằng `defaultLanding` (hoặc một path khác trong module bật) để click logo không bounce qua loading overlay.

### 7.3 `modules`

- Tắt module nào → kiểm tra lại `defaultLanding` và `logoUrl` không trỏ vào đó.
- Khi tắt `mentorNetworking`, ngoài route mentor còn ẩn: Network, News (mentor-section), Transactions, Purchases, Applications, Packages, Vouchers, payments/checkout.

### 7.4 `custom`

- Bật cờ KHÔNG tự bật tính năng. Phải có code `useFeature('custom.X')` đâu đó. Grep `useFeature('custom.X')` trước khi thêm cờ mới để chắc tên đúng.
- Tên cờ là string thường — typo silently → `false`.

### 7.5 Quy trình test

- Chạy section A (default regression) + section B (tenant mới) trong `docs/feature-flags-test-cases.md`.
- **Hard refresh** (clear cache) khi test cold-load — React Query cache có thể che bug flash.
- Mở DevTools console. Không được có `[feature-flags] Redirect loop detected` xuất hiện trong luồng bình thường (chỉ xuất hiện khi config sai).
- Chạy `yarn check` (lint + i18n + tsc) trước khi merge.

---

## 8. Loop protection — Tổng quan

Mọi guard mà redirect đến tenant-derived path đều chạy qua `isRedirectLoop`:

| Guard                         | Loại loop tránh                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------- |
| `FeatureFlagGuardLayout`      | `defaultLanding` nằm trong module đã tắt                                        |
| `TenantLandingRedirect` (`*`) | `defaultLanding` là URL không match route nào                                   |
| `AuthGuardLayout`             | `defaultLanding` là `/sign-in`, `/sign-up` (auth'd user bị đẩy về public route) |
| `RoleGuardLayout` outer       | `defaultLanding` là path của role khác (vd user truy cập admin path)            |
| `RoleGuardLayout` inner       | `defaultLanding` là role-restricted (vd Mentor-only path cho user `User`)       |

`ProjectPermissionGuardLayout` và axios refresh-token handler dùng path cứng → không tự loop được.

> Nếu thấy `[feature-flags] Redirect loop detected` trong console khi đang dev/test → đọc thông báo, fix tenant config theo gợi ý.

---

## 9. Files liên quan (quick map)

| File                                                      | Vai trò                                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/lib/feature-flags/types.ts`                          | Định nghĩa kiểu                                                          |
| `src/lib/feature-flags/default.config.ts`                 | Config mặc định (all-on)                                                 |
| `src/lib/feature-flags/tenants.config.ts`                 | **Registry — file bạn sửa khi onboard tenant**                           |
| `src/lib/feature-flags/resolve-tenant-config.ts`          | Merge default + override                                                 |
| `src/lib/feature-flags/use-feature-flags.ts`              | Hooks chính                                                              |
| `src/lib/feature-flags/use-filtered-nav-items.ts`         | Lọc nav (dùng chung sidebar + top-nav)                                   |
| `src/lib/feature-flags/redirect-loop.ts`                  | Helper phát hiện loop                                                    |
| `src/lib/feature-flags/index.ts`                          | Re-export                                                                |
| `src/layouts/feature-flag-guard.layout.tsx`               | `FeatureFlagGuardLayout`, `TenantLandingRedirect`, `TenantConfigLoading` |
| `src/layouts/auth-guard.layout.tsx`                       | Auth gate (đã loop-guarded)                                              |
| `src/layouts/role-guard.layout.tsx`                       | Role gate (đã loop-guarded)                                              |
| `src/routes/user.route.tsx`                               | Route tree — nơi bọc các module bằng guard                               |
| `src/routes/public.route.tsx`                             | Public routes (gồm `/` gắn `module.home`)                                |
| `src/components/sidebar/users/user-workspace-sidebar.tsx` | Sidebar workspace                                                        |
| `src/layouts/user-default.layout.tsx`                     | Top-nav header                                                           |
| `docs/feature-flags-test-cases.md`                        | QA test matrix (English)                                                 |

---

## 10. FAQ ngắn

**Q: Sao mình chọn registry post-login mà không phải subdomain hay build-time env?**
A: Same codebase + same build pipeline là yêu cầu cứng → loại build-time env. Subdomain phải setup DNS/SSL cho từng tenant + phá axios cookie rewrite ở dev — overkill khi đã có `organizationId` sẵn trong JWT.

**Q: Khách hàng mới có bị ảnh hưởng nếu chưa thêm vào registry?**
A: Không. `organizationId` không match → dùng `DEFAULT_TENANT_CONFIG` = tất cả flag bật → hành vi như cũ.

**Q: Khi nào cần `useFeature` vs `isFeatureEnabled`?**
A: Trong component / hook → `useFeature`. Ngoài React (axios, zustand action, utility thuần) → `isFeatureEnabled`.

**Q: Custom flag nhưng không thấy tác dụng?**
A: Cờ chỉ bật trạng thái — code phải có `useFeature('custom.X')` để đọc. Grep tên cờ trước khi thêm.

**Q: User báo blank page, không loop, console có lỗi `[feature-flags] Redirect loop detected`?**
A: Tenant config sai. Xem thông báo console — nó nói rõ guard nào trip + path nào loop. Sửa `defaultLanding` hoặc `logoUrl` trong `tenants.config.ts`.

**Q: Test xong rồi flag flicker khi đăng nhập?**
A: Đảm bảo `FeatureFlagGuardLayout` đã `if (isGettingMe) return <TenantConfigLoading />`. Cold reload với cache trống để verify.

**Q: Bao giờ chuyển sang backend cầm flag?**
A: Khi có nhu cầu thay đổi flag không cần deploy frontend. Đổi nội dung `resolve-tenant-config.ts` → React Query call, consumer giữ nguyên.
