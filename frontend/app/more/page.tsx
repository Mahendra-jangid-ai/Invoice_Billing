'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/app/app-layout'
import { MobileMoreHub } from '@/components/mobile-more-hub'
import { PageHero } from '@/components/page-hero'
import { useIsInstalledPwa } from '@/lib/use-installed-pwa'

export default function MorePage() {
  const isInstalledPwa = useIsInstalledPwa()
  const router = useRouter()

  useEffect(() => {
    if (!isInstalledPwa) {
      router.replace('/setting')
    }
  }, [isInstalledPwa, router])

  if (!isInstalledPwa) return null

  return (
    <AppLayout>
      <div className="space-y-5 animate-fade-in">
        <PageHero
          label="Account"
          title="More"
          description="Company profile, app settings, and sign out."
        />
        <MobileMoreHub />
      </div>
    </AppLayout>
  )
}
