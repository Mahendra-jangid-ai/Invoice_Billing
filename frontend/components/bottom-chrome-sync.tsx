'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useIsInstalledPwa } from '@/lib/use-installed-pwa'
import { shouldHideBottomNav } from '@/lib/mobile-chrome'

export function BottomChromeSync() {
  const pathname = usePathname()
  const isInstalledPwa = useIsInstalledPwa()

  useEffect(() => {
    const showNav = isInstalledPwa && !shouldHideBottomNav(pathname)
    document.documentElement.dataset.bottomNav = showNav ? 'visible' : 'hidden'
  }, [pathname, isInstalledPwa])

  return null
}
