import { Sidebar } from '@/components/sidebar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      <Sidebar />
      <main className="ml-64 flex-1">
        {children}
      </main>
    </div>
  )
}
