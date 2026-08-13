/** Layout tokens for bottom nav, FAB, and sticky footers on mobile. */

export const MOBILE_NAV_HEIGHT = '4rem'

export function shouldHideBottomNav(pathname: string): boolean {
  if (pathname === '/onboarding') return true
  if (pathname === '/invoices/new') return true
  if (/^\/invoices\/[^/]+\/edit$/.test(pathname)) return true
  if (/^\/invoices\/[^/]+$/.test(pathname) && pathname !== '/invoices') return true
  return false
}
