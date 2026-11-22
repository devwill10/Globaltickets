import { TIMEZONES, fromIso } from './eventTime'

const zone = (tz) => TIMEZONES.find((z) => z.value === tz) ?? TIMEZONES[0]
const offsetMin = (tz) => {
  const o = zone(tz).offset
  const [h, m] = o.slice(1).split(':').map(Number)
  return (o[0] === '-' ? -1 : 1) * (h * 60 + m)
}
export const zoneAbbr = (tz) => zone(tz).abbr

// <input type="datetime-local"> value ("2026-11-24T19:00", read as event-time) -> ISO string, and back
export function localToIso(value, tz) {
  if (!value) return null
  const [d, t] = value.split('T')
  const [y, mo, day] = d.split('-').map(Number)
  const [h, mi] = t.split(':').map(Number)
  return new Date(Date.UTC(y, mo - 1, day, h, mi) - offsetMin(tz) * 60000).toISOString()
}
export function isoToLocal(iso, tz) {
  if (!iso) return ''
  return new Date(Date.parse(iso) + offsetMin(tz) * 60000).toISOString().slice(0, 16)
}
// "Nov 24, 2026, 7:00 PM WAT"
export function formatSales(iso, tz) {
  const f = fromIso(iso, tz)
  const d = new Date(`${f.date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  return `${d}, ${f.time.replace(/^0/, '')} ${f.ampm} ${zone(tz).abbr}`
}
// 'upcoming' | 'ended' | 'open'
export function salesState(t, now = Date.now()) {
  if (t.sales_start_at && now < Date.parse(t.sales_start_at)) return 'upcoming'
  if (t.sales_end_at && now >= Date.parse(t.sales_end_at)) return 'ended'
  return 'open'
}
