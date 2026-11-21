import { supabase } from '../lib/supabase'
import { dbError } from './myEvents'

const must = ({ data, error }) => { if (error) throw new Error(dbError(error)); return data }

export async function getMyProfile(userId) {
  return must(await supabase.from('profiles').select('first_name,middle_name,last_name,business_name,account_type,phone,order_notifications').eq('id', userId).maybeSingle())
}
export async function saveProfile(userId, v) {
  must(await supabase.from('profiles').update({
    first_name: v.firstName.trim(), middle_name: v.middleName.trim() || null, last_name: v.lastName.trim(),
    business_name: v.businessName?.trim() || null, phone: v.phone.replace(/[\s()-]/g, ''),
  }).eq('id', userId))
}
export async function saveNotifications(userId, value) {
  must(await supabase.from('profiles').update({ order_notifications: value }).eq('id', userId))
}

export async function getCreditSummary() { return must(await supabase.rpc('my_credit_summary')) }
export async function listCreditLedger(userId) {
  return must(await supabase.from('email_credit_ledger').select('id,delta,kind,reason,created_at').eq('owner_id', userId).order('created_at', { ascending: false }).limit(500))
}

export async function listStaff(userId) {
  return must(await supabase.from('staff_members').select('*').eq('owner_id', userId).order('created_at'))
}
export async function addStaff(name, canCheckIn) { return must(await supabase.rpc('add_staff', { p_name: name, p_can_check_in: canCheckIn })) }
export async function updateStaff(id, patch) { must(await supabase.from('staff_members').update(patch).eq('id', id)) }
export async function getStaffEventIds(id) { return must(await supabase.from('staff_events').select('event_id').eq('staff_id', id)).map((r) => r.event_id) }
export async function saveStaffEvents(id, all, eventIds) {
  must(await supabase.from('staff_members').update({ all_events: all }).eq('id', id))
  must(await supabase.from('staff_events').delete().eq('staff_id', id))
  if (!all && eventIds.length) must(await supabase.from('staff_events').insert(eventIds.map((event_id) => ({ staff_id: id, event_id }))))
}
