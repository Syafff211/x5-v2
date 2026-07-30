'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'
import type { Profile, Role } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { DEMO_ADMIN, DEMO_CURRENT_STUDENT, DEMO_STUDENTS } from '@/lib/demo-data'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  signIn: (email: string, password: string, expectedRole: Role) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updateProfile: (patch: Partial<Profile>) => Promise<{ error: string | null }>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: false,
      initialized: false,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),

      initialize: async () => {
        const supabase = createClient()
        if (!supabase) {
          set({ initialized: true })
          return
        }
        set({ loading: true })
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
          set({ user, profile: (profile as Profile) ?? null })
        }
        set({ loading: false, initialized: true })
      },

      signIn: async (email, password, expectedRole) => {
        set({ loading: true })
        const supabase = createClient()

        // ---- Demo mode (Supabase belum dikonfigurasi) ----
        if (!supabase || !isSupabaseConfigured) {
          await new Promise((r) => setTimeout(r, 700))
          if (!email || password.length < 6) {
            set({ loading: false })
            return { error: 'Email atau password tidak valid (min. 6 karakter).' }
          }

          if (expectedRole === 'admin') {
            set({ profile: DEMO_ADMIN, user: { id: DEMO_ADMIN.id, email: DEMO_ADMIN.email } as User, loading: false })
            return { error: null }
          }

          // Cocokkan email dengan daftar siswa asli; jika tidak ada, tolak.
          const match = DEMO_STUDENTS.find((s) => s.email.toLowerCase() === email.toLowerCase())
          const profile = match ?? DEMO_CURRENT_STUDENT
          if (!match && email.toLowerCase() !== DEMO_CURRENT_STUDENT.email.toLowerCase()) {
            set({ loading: false })
            return { error: 'Email tidak terdaftar di kelas X-5. Gunakan email sekolah kamu.' }
          }
          set({ profile, user: { id: profile.id, email: profile.email } as User, loading: false })
          return { error: null }
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          set({ loading: false })
          return { error: error.message === 'Invalid login credentials' ? 'Email atau password salah.' : error.message }
        }

        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single()

        if (pErr || !profile) {
          await supabase.auth.signOut()
          set({ loading: false })
          return { error: 'Profil tidak ditemukan. Hubungi admin kelas.' }
        }

        if ((profile as Profile).role !== expectedRole) {
          await supabase.auth.signOut()
          set({ loading: false })
          return {
            error:
              expectedRole === 'admin'
                ? 'Akun ini bukan admin. Gunakan halaman Login Siswa.'
                : 'Akun ini adalah admin. Gunakan halaman Login Admin.',
          }
        }

        set({ user: data.user, profile: profile as Profile, loading: false })
        return { error: null }
      },

      signOut: async () => {
        const supabase = createClient()
        if (supabase) await supabase.auth.signOut()
        set({ user: null, profile: null })
      },

      resetPassword: async (email) => {
        const supabase = createClient()
        if (!supabase) {
          await new Promise((r) => setTimeout(r, 600))
          return { error: null }
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        })
        return { error: error?.message ?? null }
      },

      updateProfile: async (patch) => {
        const { profile } = get()
        if (!profile) return { error: 'Belum login.' }
        const supabase = createClient()
        if (!supabase) {
          set({ profile: { ...profile, ...patch, updated_at: new Date().toISOString() } })
          return { error: null }
        }
        const { error } = await supabase.from('profiles').update(patch).eq('id', profile.id)
        if (error) return { error: error.message }
        set({ profile: { ...profile, ...patch } })
        return { error: null }
      },
    }),
    {
      name: 'x5-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ profile: s.profile, user: s.user }),
    }
  )
)
