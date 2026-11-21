import { supabase } from '../lib/supabase'
import { dbError } from './myEvents'
import { CURRENCY, COUNTRY_TZ } from '../data/eventOptions'
import { toIso } from '../utils/eventTime'

function discountError(error) {
  console.error('[Supabase]', error)
  if (error?.code === '23505') return 'You already have a discount with this code.'
  if (/has been used/i.test(error?.message || '')) return error.message
  return dbError(error)
}

// Currency and time zone to use for this organiser, from their profile country
export async function getOrgContext(userId) {
  const { data } = await supabase.from('profiles').select('country').eq('id', userId).maybeSingle()
  const country = data?.country ?? 'Nigeria'
  return { currency: CURRENCY[country] ?? 'NGN', timezone: COUNTRY_TZ[country] ?? 'Africa/Lagos' }
}

export async function listDiscounts(userId) {
  const { data, error } = await supabase.from('discounts').select('*').eq('owner_id', userId).order('created_at', { ascending: false })
  if (error) throw new Error(discountError(error))
  return data
}

// v = form values, ctx = { currency, timezone }
export async function saveDiscount(v, ctx, id) {
  const row = {
    code: v.code.trim().toUpperCase(),
    kind: v.kind,
    value: Number(v.value),
    currency: ctx.currency,
    starts_at: toIso(v.startDate, v.startTime, v.startAmPm, ctx.timezone),
    ends_at: v.endDate ? toIso(v.endDate, v.endTime, v.endAmPm, ctx.timezone) : null,
    usage_mode: v.usage,
    max_uses: v.usage === 'limited' ? Number(v.maxUses) : null,
    min_tickets: v.minMode === 'tickets' ? Number(v.minTickets) : null,
    min_amount: v.minMode === 'amount' ? Number(v.minAmount) : null,
  }
  const q = id ? supabase.from('discounts').update(row).eq('id', id) : supabase.from('discounts').insert(row)
  const { data, error } = await q.select('*').single()
  if (error) throw new Error(discountError(error))
  return data
}

export async function setDiscountActive(id, isActive) {
  const { error } = await supabase.from('discounts').update({ is_active: isActive }).eq('id', id)
  if (error) throw new Error(discountError(error))
}

export async function deleteDiscount(id) {
  const { error } = await supabase.from('discounts').delete().eq('id', id)
  if (error) throw new Error(discountError(error))
}

// Events a code can be applied to: yours, not ended, with at least one PAID ticket (and the same currency for fixed amounts)
export async function listAssignableEvents(userId, discount) {
  const { data, error } = await supabase.from('events')
    .select('id,title,starts_at,ends_at,currency,status,ticket_tiers(price_minor)')
    .eq('owner_id', userId).in('status', ['draft', 'published']).order('starts_at')
  if (error) throw new Error(discountError(error))
  return data.filter((e) =>
    e.ticket_tiers?.some((t) => t.price_minor > 0) &&
    new Date(e.ends_at ?? e.starts_at) > new Date() &&
    (discount.kind === 'percent' || e.currency === discount.currency))
}

export async function getAssignedEventIds(discountId) {
  const { data, error } = await supabase.from('discount_events').select('event_id').eq('discount_id', discountId)
  if (error) throw new Error(discountError(error))
  return data.map((r) => r.event_id)
}

export async function saveAssignments(discountId, all, eventIds) {
  let res = await supabase.from('discounts').update({ applies_to_all: all }).eq('id', discountId)
  if (res.error) throw new Error(discountError(res.error))
  res = await supabase.from('discount_events').delete().eq('discount_id', discountId)
  if (res.error) throw new Error(discountError(res.error))
  if (!all && eventIds.length) {
    res = await supabase.from('discount_events').insert(eventIds.map((event_id) => ({ discount_id: discountId, event_id })))
    if (res.error) throw new Error(discountError(res.error))
  }
}
