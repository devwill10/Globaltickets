import { supabase } from '../lib/supabase'
import { fromIso } from '../utils/eventTime'

// On scan.yourdomain.com the pages live at the root; everywhere else (like localhost) under /scan
export const IS_SCAN_HOST = typeof window !== 'undefined' && window.location.hostname.startsWith('scan.')
export const scanPath = (p = '') => `${IS_SCAN_HOST ? '' : '/scan'}${p}` || '/'

const KEY = 'tg_staff'
export const getStaff = () => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } }
export const saveStaff = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* private mode */ } }
export const clearStaff = () => { try { localStorage.removeItem(KEY) } catch { /* ignore */ } }

export class SigninError extends Error {}

async function call(fn, args) {
  const { data, error } = await supabase.rpc(fn, args)
  if (error) {
    console.error('[scan]', error)
    throw new Error(error.code === 'P0001' ? error.message : 'Something went wrong. Please try again.')
  }
  if (data?.error === 'signin') { clearStaff(); throw new SigninError('Please sign in again.') }
  return data
}
const pass = () => getStaff()?.passcode ?? ''

export async function staffSignIn(passcode) {
  const data = await call('staff_sign_in', { p_passcode: passcode.trim() })
  if (!data.ok) throw new Error("That code isn't right. Check it and try again.")
  saveStaff({ passcode: passcode.trim(), name: data.name })
  return data
}
export async function listStaffEvents() {
  const d = await call('staff_list_events', { p_passcode: pass() })
  return d.events
}
export async function listAttendees(eventId, { search = '', page = 1, desc = false } = {}) {
  const d = await call('staff_attendees', { p_passcode: pass(), p_event_id: eventId, p_search: search, p_page: page, p_desc: desc })
  if (!d.ok) throw new Error(d.error)
  return d
}
// checkIn=false only looks the ticket up
export async function staffTicket(code, eventId, checkIn = false) {
  return call('staff_ticket', { p_passcode: pass(), p_code: code, p_event_id: eventId, p_check_in: checkIn })
}

// ---- display helpers ----
export const dateOnly = (iso, tz) =>
  new Date(`${fromIso(iso, tz).date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
export const dateTime = (iso, tz) => { const f = fromIso(iso, tz); return `${dateOnly(iso, tz)} ${f.time.replace(/^0/, '')} ${f.ampm}` }
export const checkedInTime = (iso) => {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase()
  return `${date} ${time}`
}
export function eventState(e) {
  if (e.status !== 'published') return { label: 'Inactive', cls: 'bg-red-50 text-red-600' }
  const now = Date.now(), start = Date.parse(e.starts_at), end = e.ends_at ? Date.parse(e.ends_at) : start + 12 * 3600e3
  if (now < start) return { label: 'Not started', cls: 'bg-ink/5 text-ink' }
  if (now > end) return { label: 'Ended', cls: 'bg-ink/5 text-ink/60' }
  return { label: 'In progress', cls: 'bg-green-50 text-green-700' }
}
