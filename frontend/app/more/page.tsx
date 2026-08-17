'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/app/app-layout'
import { MobileMoreHub } from '@/components/mobile-more-hub'
import { PageHero } from '@/components/page-hero'
import { useIsInstalledPwa } from '@/lib/use-installed-pwa'

export default function MorePage() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      router.replace('/setting')
    }
  }, [router])

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
