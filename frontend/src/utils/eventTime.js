// All supported zones have no daylight saving, so a fixed offset is exact.
export const TIMEZONES = [
  { value: 'Africa/Lagos', label: '(UTC+01:00) West Central Africa', offset: '+01:00', abbr: 'WAT' },
  { value: 'Africa/Accra', label: '(UTC+00:00) Greenwich Mean Time, Accra', offset: '+00:00', abbr: 'GMT' },
  { value: 'Africa/Johannesburg', label: '(UTC+02:00) South Africa, Harare', offset: '+02:00', abbr: 'SAST' },
  { value: 'Africa/Nairobi', label: '(UTC+03:00) East Africa, Nairobi', offset: '+03:00', abbr: 'EAT' },
]
const zone = (tz) => TIMEZONES.find((z) => z.value === tz) ?? TIMEZONES[0]
const offsetMinutes = (tz) => {
  const [h, m] = zone(tz).offset.slice(1).split(':').map(Number)
  return (zone(tz).offset[0] === '-' ? -1 : 1) * (h * 60 + m)
}

export function to24(text, ampm) {
  const m = /^(0?[1-9]|1[0-2]):([0-5]\d)$/.exec((text || '').trim())
  if (!m) return null
  const h = (Number(m[1]) % 12) + (ampm === 'PM' ? 12 : 0)
  return `${String(h).padStart(2, '0')}:${m[2]}`
}

// date 'YYYY-MM-DD' + 'hh:mm' + AM/PM in the event's zone -> ISO instant (or null)
export function toIso(date, time, ampm, tz) {
  const t = to24(time, ampm)
  if (!date || !t) return null
  const d = new Date(`${date}T${t}:00${zone(tz).offset}`)
  return Number.isNaN(+d) ? null : d.toISOString()
}

export function fromIso(iso, tz) {
  const d = new Date(Date.parse(iso) + offsetMinutes(tz) * 60000)
  const h = d.getUTCHours()
  const p = (n) => String(n).padStart(2, '0')
  return {
    date: `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`,
    time: `${p(h % 12 || 12)}:${p(d.getUTCMinutes())}`,
    ampm: h >= 12 ? 'PM' : 'AM',
  }
}

const clock = (iso, tz) => { const f = fromIso(iso, tz); return `${f.time.replace(/^0/, '')} ${f.ampm}` }
const longDate = (iso, tz) => {
  const f = fromIso(iso, tz)
  return new Date(`${f.date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}

export function formatWhen(startsAt, endsAt, tz) {
  if (!startsAt) return { date: '', time: '' }
  const abbr = zone(tz).abbr
  return {
    date: longDate(startsAt, tz),
    time: endsAt ? `${clock(startsAt, tz)} - ${clock(endsAt, tz)} ${abbr}` : `${clock(startsAt, tz)} ${abbr}`,
  }
}

const ordinal = (n) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]) }
// "November 11th, 2026" in the given zone
export function formatDateLong(iso, tz) {
  const d = new Date(`${fromIso(iso, tz).date}T12:00:00Z`)
  return `${d.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' })} ${ordinal(d.getUTCDate())}, ${d.getUTCFullYear()}`
}
