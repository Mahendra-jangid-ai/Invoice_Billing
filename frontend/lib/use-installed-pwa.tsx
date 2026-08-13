'use client'

import { createContext, useContext, useEffect, useState } from 'react'

function detectInstalledPwa(): boolean {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

const PwaShellContext = createContext(false)

export function PwaShellProvider({ children }: { children: React.ReactNode }) {
  const [isInstalledPwa, setIsInstalledPwa] = useState(() => {
    const installed = detectInstalledPwa()
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.pwaShell = installed ? 'true' : 'false'
    }
    return installed
  })

  useEffect(() => {
    const sync = () => {
      const installed = detectInstalledPwa()
      setIsInstalledPwa(installed)
      document.documentElement.dataset.pwaShell = installed ? 'true' : 'false'
    }

    sync()

    const media = window.matchMedia('(display-mode: standalone)')
    media.addEventListener('change', sync)
    window.addEventListener('resize', sync)

    return () => {
      media.removeEventListener('change', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  return <PwaShellContext.Provider value={isInstalledPwa}>{children}</PwaShellContext.Provider>
}

export function useIsInstalledPwa(): boolean {
  return useContext(PwaShellContext)
}
