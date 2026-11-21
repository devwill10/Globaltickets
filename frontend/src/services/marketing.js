import { supabase } from '../lib/supabase'

function fail(error, fallback = 'Something went wrong. Please try again.') {
  console.error('[Supabase]', error)
  // Messages we raise ourselves (P0001) are written for users
  throw new Error(error?.code === 'P0001' && !/not_allowed|not_found/.test(error.message) ? error.message : fallback)
}
const must = ({ data, error }) => { if (error) fail(error); return data }

export const getOverview = async () => must(await supabase.rpc('marketing_overview'))
export const listSubscribers = async () => must(await supabase.rpc('my_subscribers'))
export const recipientCount = async (audience, ref) => must(await supabase.rpc('recipient_count', { p_audience: audience, p_ref: ref ?? null }))

export async function importSubscribers(rows) {
  return must(await supabase.rpc('import_subscribers', { p_rows: rows }))
}

export async function listSegments(userId) {
  return must(await supabase.from('email_segments').select('*').eq('owner_id', userId).order('created_at', { ascending: false }))
}
export async function saveSegment(v, id) {
  const row = { name: v.name.trim(), match: v.match, conditions: v.conditions.map((c) => ({ type: c.type, value: String(Number(c.value)) })) }
  const q = id ? supabase.from('email_segments').update(row).eq('id', id) : supabase.from('email_segments').insert(row)
  return must(await q.select('*').single())
}
export async function deleteSegment(id) { must(await supabase.from('email_segments').delete().eq('id', id)) }

export async function listCampaigns(userId) {
  return must(await supabase.from('email_campaigns').select('id,subject,audience,audience_name,recipients,status,created_at,sent_at')
    .eq('owner_id', userId).order('created_at', { ascending: false }))
}

// Published events that haven't ended: the ones you can email attendees of
export async function listEmailableEvents(userId) {
  const { data, error } = await supabase.from('events').select('id,title,starts_at,ends_at,status')
    .eq('owner_id', userId).eq('status', 'published').order('starts_at')
  if (error) fail(error)
  return data.filter((e) => new Date(e.ends_at ?? e.starts_at) > new Date())
}
export async function getEventTitle(userId, id) {
  const { data } = await supabase.from('events').select('title').eq('id', id).eq('owner_id', userId).maybeSingle()
  return data?.title ?? null
}

// Sending needs an email service connected on the server (and credits). Not available yet.
export async function sendTestEmail() { throw new Error('Sending email is not switched on yet.') }
export async function sendCampaign() { throw new Error('Sending email is not switched on yet.') }

export const getCredits = async () => must(await supabase.rpc('my_email_credits'))
