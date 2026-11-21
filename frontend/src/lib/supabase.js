import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  throw new Error('Missing Supabase settings. Copy .env.example to .env.local, fill it in, and restart npm run dev.')
}

export const supabase = createClient(url, key, { auth: { flowType: 'pkce' } })
