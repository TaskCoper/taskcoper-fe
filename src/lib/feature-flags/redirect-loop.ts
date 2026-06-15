// Detects misconfigured tenants where a guard would redirect to the same path
// it is currently mounted on, causing an infinite redirect loop. Used by every
// guard whose redirect target is sourced from the tenant config
// (`config.defaultLanding` via `useRoleHomePath`) — not by guards that
// redirect to hardcoded paths like `/sign-in` or `/verify-email`.
//
// When this returns `true`, the caller should bail out (render `null` or
// `<Outlet />`) instead of issuing the redirect. The console error tells the
// dev which guard tripped and points at the config file to fix.
export function isRedirectLoop(currentPathname: string, target: string, source: string): boolean {
  if (currentPathname !== target) return false

  console.error(
    `[feature-flags] Redirect loop detected — ${source} would redirect to "${target}" ` +
      `which equals the current path. Fix the tenant config in src/lib/feature-flags/tenants.config.ts ` +
      `(check defaultLanding / logoUrl point at a path inside an enabled, role-accessible module).`
  )

  return true
}
