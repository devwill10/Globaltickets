import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// Auth state mirrors the Supabase session. Nothing is stored by us in localStorage;
// Supabase manages the session. Role/permissions always come from the database.
const nameFrom = (p, fallback) =>
  p?.business_name || [p?.first_name, p?.last_name].filter(Boolean).join(' ') || fallback

export const useAuthStore = create((set, get) => ({
  user: null,          // { id, email, name, role, accountType, profileLoaded }
  initialized: false,  // true once Supabase has told us whether someone is signed in
  started: false,

  init() {
    if (get().started) return
    set({ started: true })
    supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user
      if (!u) { set({ user: null, initialized: true }); return }
      const m = u.user_metadata ?? {}
      // Show something immediately (display only); real role arrives with the profile below.
      set((s) => ({
        user: s.user?.id === u.id ? s.user : {
          id: u.id, email: u.email, role: null, profileLoaded: false,
          accountType: m.account_type ?? 'individual',
          name: m.business_name || [m.first_name, m.last_name].filter(Boolean).join(' ') || u.email.split('@')[0],
        },
        initialized: true,
      }))
      if (['INITIAL_SESSION', 'SIGNED_IN', 'USER_UPDATED', 'PASSWORD_RECOVERY'].includes(event)) {
        setTimeout(() => loadProfile(u), 0) // never call Supabase inside this callback directly
      }
    })
  },

  logout: async () => { await supabase.auth.signOut() },

  // Re-read the profile (for example after the person edits their name)
  refreshProfile: async () => { const u = get().user; if (u) await loadProfile({ id: u.id }) },
}))

async function loadProfile(u) {
  const { data: p } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle()
  if (p?.is_suspended) { await supabase.auth.signOut(); return }
  useAuthStore.setState((s) => (s.user?.id === u.id ? {
    user: {
      ...s.user, role: p?.role ?? 'user', accountType: p?.account_type ?? s.user.accountType,
      name: nameFrom(p, s.user.name), profileLoaded: true,
    },
  } : s))
}
