import { supabase } from '../lib/supabase'

// Returns { Nigeria: { percent, flat, symbol }, ... } from the database (single source of truth).
export async function getPricing() {
  const { data, error } = await supabase.from('pricing_settings').select('*').order('country')
  if (error) throw error
  return Object.fromEntries(data.map((r) => [r.country, { percent: Number(r.percent), flat: Number(r.flat_fee), symbol: r.symbol }]))
}
