'use client'

import { usePathname } from 'next/navigation'
import { shouldHideBottomNav } from '@/lib/mobile-chrome'
import { useIsInstalledPwa } from '@/lib/use-installed-pwa'

/** Physical spacer so the last card/row is never hidden under the tab bar. */
export function MobileBottomSpacer() {
  const pathname = usePathname()
  const isInstalledPwa = useIsInstalledPwa()

  if (!isInstalledPwa) return null

  // Invoice detail uses its own fixed footer + invoice-detail-mobile padding.
  if (/^\/invoices\/[^/]+$/.test(pathname) && pathname !== '/invoices') return null

  if (shouldHideBottomNav(pathname)) {
    return (
      <div
        className="pointer-events-none shrink-0 md:hidden"
        style={{ height: 'calc(var(--mobile-form-sticky-h) + var(--mobile-safe-bottom))' }}
        aria-hidden
      />
    )
  }

  return (
    <div
      className="pointer-events-none shrink-0 md:hidden"
      style={{ height: 'var(--mobile-content-inset)' }}
      aria-hidden
    />
  )
}
