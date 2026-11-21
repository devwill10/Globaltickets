import { supabase } from '../lib/supabase'
import { CURRENCY, tagToCategory } from '../data/eventOptions'
import { toIso, fromIso } from '../utils/eventTime'

export function dbError(error) {
  console.error('[Supabase]', error) // full technical detail for debugging (browser console)
  const msg = error?.message || ''
  if (error?.code === '23503') return "This ticket already has sales, so it can't be deleted."
  if (error?.code === '23505') return 'That custom URL is already taken. Try another.'
  if (/too many events|verify your email|at least one ticket|payouts/i.test(msg)) return msg
  if (/row-level security|permission denied/i.test(msg)) return "You don't have permission to do that."
  return 'Something went wrong. Please try again.'
}

// Form values -> database row
export function toRow(v) {
  const social = Object.fromEntries(Object.entries(v.social).filter(([, val]) => val.trim()))
  return {
    title: v.title.trim(),
    description: v.description,
    category: tagToCategory[v.tags[0]] ?? 'Community',
    country: v.country,
    currency: CURRENCY[v.country] ?? 'NGN',
    venue: v.address.trim(),
    location_tip: v.locationTip.trim() || null,
    custom_slug: v.slug.trim() || null,
    format: v.format,
    tags: v.tags,
    timezone: v.timezone,
    schedule_type: 'single',
    starts_at: toIso(v.startDate, v.startTime, v.startAmPm, v.timezone),
    ends_at: toIso(v.endDate, v.endTime, v.endAmPm, v.timezone),
    lineup_title: v.lineup.length ? v.lineupTitle || 'Artists' : null,
    lineup: v.lineup,
    social,
  }
}

// Database row -> form values
export function fromRow(r) {
  const s = fromIso(r.starts_at, r.timezone)
  const e = r.ends_at ? fromIso(r.ends_at, r.timezone) : { date: '', time: '', ampm: 'AM' }
  return {
    title: r.title, description: r.description ?? '', country: r.country, address: r.venue ?? '',
    locationTip: r.location_tip ?? '', slug: r.custom_slug ?? '', format: r.format ?? '', tags: r.tags ?? [],
    timezone: r.timezone, startDate: s.date, startTime: s.time, startAmPm: s.ampm,
    endDate: e.date, endTime: e.time, endAmPm: e.ampm,
    lineupTitle: r.lineup_title ?? '', lineup: r.lineup ?? [],
    social: { website: '', instagram: '', x: '', facebook: '', ...(r.social ?? {}) },
  }
}

export async function listMyEvents(userId) {
  // RLS also lets everyone read PUBLISHED events, so always filter by owner here.
  const { data, error } = await supabase.from('events')
    .select('id,title,status,starts_at,ends_at,venue,image_url,created_at,ticket_tiers(count)')
    .eq('owner_id', userId).order('created_at', { ascending: false })
  if (error) throw new Error(dbError(error))
  return data.map((e) => ({ ...e, tickets: e.ticket_tiers?.[0]?.count ?? 0 }))
}

export async function getMyEvent(id, userId) {
  const { data, error } = await supabase.from('events').select('*, ticket_tiers(count)')
    .eq('id', id).eq('owner_id', userId).maybeSingle()
  if (error) throw new Error(dbError(error))
  return data ? { ...data, tickets: data.ticket_tiers?.[0]?.count ?? 0 } : null
}

export async function createEvent(row) {
  const { data, error } = await supabase.from('events').insert({ ...row, status: 'draft' }).select('id').single()
  if (error) throw new Error(dbError(error))
  return data.id
}

export async function updateEvent(id, patch) {
  const { error } = await supabase.from('events').update(patch).eq('id', id)
  if (error) throw new Error(dbError(error))
}

export const setEventStatus = (id, status) => updateEvent(id, { status })

export async function deleteEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw new Error(dbError(error))
}

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'video/mp4': 'mp4' }

// Uploads into <userId>/<eventKey>/<random>.<ext> and returns { url, path }
export async function uploadMedia(userId, eventKey, file) {
  const ext = EXT[file.type]
  if (!ext) throw new Error('Unsupported file type.')
  const path = `${userId}/${eventKey}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('event-media').upload(path, file, { contentType: file.type })
  if (error) throw new Error('Upload failed. Please try again.')
  return { url: supabase.storage.from('event-media').getPublicUrl(path).data.publicUrl, path }
}
