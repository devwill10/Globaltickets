import { supabase } from '../lib/supabase'

export const toEvent = (r) => ({
  id: r.id, title: r.title, date: r.starts_at, venue: r.venue, city: r.city,
  country: r.country, category: r.category, currency: r.currency,
  price: r.min_price_minor / 100, // minor units -> major units for display
  highlighted: r.is_highlighted, image: r.image_url,
})

function dateRange(filter) {
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const day = 86400000
  if (filter === 'today') return [startToday, new Date(+startToday + day)]
  if (filter === 'week') return [startToday, new Date(+startToday + 7 * day)]
  if (filter === 'month') return [new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 1)]
  return null
}

export async function listEvents({ country, category = 'all', price = 'all', date = 'all', limit = 10 }) {
  let q = supabase.from('events_public').select('*', { count: 'exact' }).gte('starts_at', new Date().toISOString())
  if (country) q = q.eq('country', country)
  if (category !== 'all') q = q.eq('category', category)
  if (price === 'free') q = q.eq('min_price_minor', 0)
  if (price === 'paid') q = q.gt('min_price_minor', 0)
  const r = dateRange(date)
  if (r) q = q.gte('starts_at', r[0].toISOString()).lt('starts_at', r[1].toISOString())
  const { data, error, count } = await q.order('starts_at', { ascending: true }).range(0, limit - 1)
  if (error) throw error
  return { items: data.map(toEvent), total: count ?? data.length }
}

export async function listHighlighted(country) {
  const { data, error } = await supabase.from('events_public').select('*')
    .eq('is_highlighted', true).eq('country', country)
    .gte('starts_at', new Date().toISOString()).order('starts_at').limit(5)
  if (error) throw error
  return data.map(toEvent)
}
