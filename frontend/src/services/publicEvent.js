import { supabase } from '../lib/supabase'
import { toEvent } from './events'

// Explicit columns: logged-out visitors are not allowed to read `owner_id`, so select('*') would fail.
const COLS = 'id,title,description,category,country,city,venue,starts_at,ends_at,currency,image_url,status,format,tags,location_tip,custom_slug,timezone,lineup_title,lineup,social,media,theme,theme_color'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// key = event id or custom URL slug
export async function getPublicEvent(key) {
  const q = supabase.from('events').select(COLS)
  const { data, error } = await (UUID.test(key) ? q.eq('id', key) : q.eq('custom_slug', key.toLowerCase())).maybeSingle()
  if (error) throw error
  return data
}

export async function listPublicTiers(eventId) {
  const { data, error } = await supabase.from('ticket_tiers')
    .select('id,name,description,price_minor,quantity,order_limit,perks,ticket_kind,group_size,is_invite_only,sort_order')
    .eq('event_id', eventId).order('sort_order')
  if (error) throw error
  return data
}

// { [tierId]: remaining | null }  (null = unlimited)
export async function getAvailability(eventId) {
  const { data, error } = await supabase.rpc('tier_availability', { p_event_id: eventId })
  if (error) throw error
  return Object.fromEntries(data.map((r) => [r.tier_id, r.remaining]))
}

export async function listRelated(event) {
  const { data, error } = await supabase.from('events_public').select('*')
    .eq('country', event.country).neq('id', event.id)
    .gte('starts_at', new Date().toISOString()).order('starts_at').limit(8)
  if (error) throw error
  return data.map(toEvent).sort((a, b) => (b.category === event.category) - (a.category === event.category)).slice(0, 2)
}

export async function claimFreeTickets({ eventId, items, first, last, email, phone, attendees, marketingConsent = false }) {
  const { data, error } = await supabase.rpc('claim_tickets', {
    p_event_id: eventId, p_items: items, p_first: first, p_last: last, p_email: email, p_phone: phone,
    p_attendees: attendees ?? null, p_marketing_consent: marketingConsent,
  })
  if (error) {
    console.error('[Supabase]', error)
    // Messages we raise ourselves (code P0001) are written for users; anything else stays generic.
    throw new Error(error.code === 'P0001' ? error.message : 'Something went wrong. Please try again.')
  }
  return data
}
