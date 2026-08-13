'use client'

import { useEffect, useState } from 'react'
import { useIsInstalledPwa } from '@/lib/use-installed-pwa'

/** Mobile / installed PWA: compact card + sticky footer instead of inline PDF. */
export function useCompactInvoiceView(): boolean {
  const isInstalledPwa = useIsInstalledPwa()
  const [isNarrow, setIsNarrow] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 767px)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsNarrow(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isInstalledPwa || isNarrow
}
