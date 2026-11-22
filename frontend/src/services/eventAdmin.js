import { supabase } from '../lib/supabase'

async function rpc(fn, args) {
  const { data, error } = await supabase.rpc(fn, args)
  if (error) {
    console.error('[eventAdmin]', error)
    throw new Error(/not_allowed/.test(error.message) ? "You can't view this event." : 'Something went wrong. Please try again.')
  }
  return data
}

export const getEventSales = (eventId) => rpc('event_sales', { p_event_id: eventId })
export const getEventAttendees = (eventId, { search = '', page = 1, size = 20 } = {}) =>
  rpc('event_attendees', { p_event_id: eventId, p_search: search, p_page: page, p_size: size })

export async function getAllAttendees(eventId, max = 5000) {
  const out = []
  for (let page = 1; out.length < max; page++) {
    const d = await getEventAttendees(eventId, { page, size: 500 })
    out.push(...d.rows)
    if (page >= d.pages) break
  }
  return out
}

// CSV for spreadsheets. Cells that start with = + - @ are prefixed so a spreadsheet never runs them as formulas.
const cell = (v) => {
  let s = String(v ?? '')
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}
export function attendeesCsv(rows) {
  const head = ['Name', 'Email', 'Ticket', 'Order ID', 'Bought by', 'Buyer email', 'Status', 'Checked in at', 'Checked in by', 'Sold', 'Purchased']
  const lines = rows.map((r) => [r.holder_name, r.holder_email, r.tier_name, r.ref, r.buyer_name, r.buyer_email,
    r.status === 'used' ? 'Checked in' : 'Not checked in', r.checked_in_at ?? '', r.checked_in_by ?? '', r.source === 'door' ? 'Door' : 'Online', r.bought_at].map(cell).join(','))
  return '\uFEFF' + [head.map(cell).join(','), ...lines].join('\r\n')
}
export function downloadCsv(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
