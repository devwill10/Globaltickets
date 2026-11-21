import { supabase } from '../lib/supabase'
import { dbError } from './myEvents'
import { toEvent } from './events'

const COLS = 'id,title,description,slug,image_url,social,theme,settings,status,created_at'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const must = ({ data, error }) => { if (error) throw new Error(dbError(error)); return data }

export async function listBoxOffices(userId) {
  const data = must(await supabase.from('box_offices').select('id,title,image_url,status,slug,created_at,box_office_events(count)')
    .eq('owner_id', userId).order('created_at', { ascending: false }))
  return data.map((b) => ({ ...b, events: b.box_office_events?.[0]?.count ?? 0 }))
}
export async function getBoxOffice(id, userId) {
  return must(await supabase.from('box_offices').select(COLS).eq('id', id).eq('owner_id', userId).maybeSingle())
}
export async function createBoxOffice(row) { return must(await supabase.from('box_offices').insert({ ...row, status: 'draft' }).select('id').single()).id }
export async function updateBoxOffice(id, patch) { must(await supabase.from('box_offices').update(patch).eq('id', id)) }
export async function deleteBoxOffice(id) { must(await supabase.from('box_offices').delete().eq('id', id)) }

export async function getBoxOfficeEventIds(id) {
  return must(await supabase.from('box_office_events').select('event_id').eq('box_office_id', id)).map((r) => r.event_id)
}
export async function addBoxOfficeEvent(id, eventId) { must(await supabase.from('box_office_events').insert({ box_office_id: id, event_id: eventId })) }
export async function removeBoxOfficeEvent(id, eventId) { must(await supabase.from('box_office_events').delete().eq('box_office_id', id).eq('event_id', eventId)) }

// Your published events, with tickets sold, for choosing what goes in a box office
export async function listMyPublishedEvents(userId) {
  const data = must(await supabase.from('events')
    .select('id,title,venue,starts_at,ends_at,image_url,currency,tickets(count),ticket_tiers(price_minor,is_invite_only)')
    .eq('owner_id', userId).eq('status', 'published').order('starts_at', { ascending: false }))
  return data.map((e) => {
    const prices = (e.ticket_tiers ?? []).filter((t) => !t.is_invite_only).map((t) => t.price_minor)
    return { ...e, sold: e.tickets?.[0]?.count ?? 0, date: e.starts_at, image: e.image_url, price: prices.length ? Math.min(...prices) / 100 : 0 }
  })
}

// Public: by id or custom URL
export async function getPublicBoxOffice(key) {
  const q = supabase.from('box_offices').select(COLS)
  return must(await (UUID.test(key) ? q.eq('id', key) : q.eq('slug', key.toLowerCase())).maybeSingle())
}
export async function listPublicBoxOfficeEvents(id) {
  const ids = await getBoxOfficeEventIds(id)
  if (!ids.length) return []
  const rows = must(await supabase.from('events_public').select('*').in('id', ids).gte('starts_at', new Date().toISOString()).order('starts_at'))
  return rows.map(toEvent)
}
