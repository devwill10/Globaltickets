import { supabase } from '../lib/supabase'
import { dbError } from './myEvents'

const COLS = 'id,event_id,name,description,price_minor,quantity,sort_order,order_limit,is_invite_only,requires_approval,perks,ticket_kind,group_size,created_at'

export async function listTiers(eventId) {
  const { data, error } = await supabase.from('ticket_tiers').select(COLS)
    .eq('event_id', eventId).order('sort_order').order('created_at')
  if (error) throw new Error(dbError(error))
  return data
}

// v = form values. Free tickets have price 0. The password is hashed on the server.
export async function saveTier(eventId, v, tierId, sortOrder = 0) {
  const row = {
    name: v.name.trim(),
    description: v.description.trim(),
    price_minor: v.isPaid ? Math.round(Number(v.price) * 100) : 0,
    quantity: v.qtyMode === 'unlimited' ? null : Number(v.quantity),
    ticket_kind: v.kind,
    group_size: v.kind === 'group' ? Number(v.groupSize) : null,
    // Group tickets have no per-person limit field in the form, so they use the default of 5
    order_limit: v.inviteOnly ? 1 : v.kind === 'group' ? 5 : Number(v.orderLimit),
    is_invite_only: v.inviteOnly,
    requires_approval: v.inviteOnly && v.approval,
    perks: v.perks.map((p) => p.trim()).filter(Boolean),
  }
  let id = tierId
  if (tierId) {
    const { error } = await supabase.from('ticket_tiers').update(row).eq('id', tierId)
    if (error) throw new Error(dbError(error))
  } else {
    const { data, error } = await supabase.from('ticket_tiers').insert({ ...row, event_id: eventId, sort_order: sortOrder }).select('id').single()
    if (error) throw new Error(dbError(error))
    id = data.id
  }
  if (v.inviteOnly && v.password) {
    const { error } = await supabase.rpc('set_ticket_password', { p_tier_id: id, p_password: v.password })
    if (error) {
      if (!tierId) await supabase.from('ticket_tiers').delete().eq('id', id) // don't leave an invite-only ticket without a password
      throw new Error(/6 to 72/.test(error.message) ? error.message : 'Could not save the password. Please try again.')
    }
  }
  return id
}

export async function deleteTier(id) {
  const { error } = await supabase.from('ticket_tiers').delete().eq('id', id)
  if (error) throw new Error(dbError(error))
}
