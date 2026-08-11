import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────────────────────
   Base Skeleton  — shimmer wave effect
───────────────────────────────────────────────────────────────────────────── */
interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-[#F1F5F9]',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent',
        'before:animate-[shimmer_1.5s_infinite]',
        className
      )}
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Composed Skeleton Atoms
───────────────────────────────────────────────────────────────────────────── */

export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="premium-card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-12 w-12 rounded-2xl flex-shrink-0" />
      </div>
    </div>
  )
}

export function SkeletonHero() {
  return (
    <div className="hero-card p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-72 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-24 w-48 rounded-3xl flex-shrink-0" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="premium-card overflow-hidden p-0">
      {/* header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-52" />
        </div>
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-5 py-3.5">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <SkeletonTableRow key={i} cols={cols} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page-level Skeletons
───────────────────────────────────────────────────────────────────────────── */

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SkeletonHero />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="premium-card p-6 space-y-5">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-52" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="premium-card p-6 space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>

      <SkeletonTable rows={4} cols={5} />
    </div>
  )
}

export function SkeletonListPage({ cols = 6 }: { cols?: number }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="hero-card p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-72 max-w-full" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <Skeleton className="h-11 w-36 rounded-2xl flex-shrink-0" />
        </div>
      </div>
      <SkeletonTable rows={5} cols={cols} />
    </div>
  )
}

export function SkeletonInvoicesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="hero-card p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-80 max-w-full" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <Skeleton className="h-11 w-40 rounded-2xl flex-shrink-0" />
        </div>
      </div>
      <SkeletonTable rows={5} cols={6} />
    </div>
  )
}
