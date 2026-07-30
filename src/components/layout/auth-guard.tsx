'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useDataStore } from '@/store/data-store'
import type { Role } from '@/types/database'

export function AuthGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter()
  const profile = useAuthStore((s) => s.profile)
  const initialize = useAuthStore((s) => s.initialize)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      // Rehydrate from Supabase session when configured.
      if (!useAuthStore.getState().initialized) await initialize()
      if (!active) return

      const current = useAuthStore.getState().profile
      if (!current) {
        router.replace(role === 'admin' ? '/auth/admin' : '/auth/login')
        return
      }
      if (current.role !== role) {
        router.replace(current.role === 'admin' ? '/admin' : '/dashboard')
        return
      }

      // Tarik data terbaru dari Supabase sekali per sesi.
      if (!useDataStore.getState().hydrated) {
        await useDataStore.getState().hydrateFromSupabase()
      }
      if (!active) return
      setChecked(true)
    })()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  if (!checked || !profile) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl brand-gradient text-white shadow-lg shadow-primary/30">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
