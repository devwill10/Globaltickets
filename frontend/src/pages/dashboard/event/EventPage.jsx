import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronDown, CalendarDays, Clock, MapPin, Info } from 'lucide-react'
import { getMyEvent } from '../../../services/myEvents'
import { useAuthStore } from '../../../store/authStore'
import { fromIso, formatDateLong, formatWhen } from '../../../utils/eventTime'

const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`
function span(ms) {
  const m = Math.floor(ms / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24)
  return d >= 1 ? plural(d, 'day') : h >= 1 ? plural(h, 'hour') : plural(Math.max(m, 1), 'minute')
}

function menu(id, publicPath) {
  const b = `/dashboard/events/${id}`
  return [
    { label: 'Event setup', items: [['Details', `${b}/details`], ['Appearance', `${b}/appearance`]] },
    { label: 'Tickets', items: [['Manage tickets', `${b}/tickets`], ['Discount codes', '/dashboard/discounts']] },
    { label: 'Attendees', items: [['Attendee list', `${b}/attendees`], ['Staff & check-in', '/dashboard/account?tab=staff']] },
    { label: 'Finance', items: [['Sales summary', `${b}/finance`], ['Payout account', '/dashboard/account?tab=payouts']] },
    { label: 'Marketing', items: [['Email announcements', '/dashboard/marketing'], ['Box office', '/dashboard/box-office']] },
    { label: 'Reports', to: `${b}/reports` },
    { label: 'Settings', items: [['Event status & link', `${b}/settings`], ['View event page', publicPath, true]] },
  ]
}

function Tabs({ groups, pathname }) {
  const [open, setOpen] = useState(null)
  const ref = useRef(null)
  useEffect(() => {
    const away = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(null) }
    const esc = (e) => { if (e.key === 'Escape') setOpen(null) }
    document.addEventListener('mousedown', away); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc) }
  }, [])
  useEffect(() => setOpen(null), [pathname])

  return (
    <nav ref={ref} aria-label="Event" className="mt-10 flex flex-wrap gap-x-8 gap-y-1 border-b border-ink/10">
      {groups.map((g) => {
        const active = g.to ? g.to === pathname : g.items.some(([, to]) => to === pathname)
        const cls = `-mb-px flex items-center gap-2 border-b-2 py-4 text-[15px] ${active ? 'border-brand text-brand' : 'border-transparent hover:text-brand'}`
        if (g.to) return <Link key={g.label} to={g.to} aria-current={active ? 'page' : undefined} className={cls}>{g.label}</Link>
        return (
          <div key={g.label} className="relative">
            <button type="button" aria-haspopup="menu" aria-expanded={open === g.label} onClick={() => setOpen(open === g.label ? null : g.label)} className={cls}>
              {g.label}<ChevronDown size={15} className={open === g.label ? 'rotate-180' : ''} />
            </button>
            {open === g.label && (
              <ul role="menu" className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-ink/10 bg-white py-2 shadow-lg">
                {g.items.map(([label, to, external]) => (
                  <li key={label} role="none">
                    {external
                      ? <a role="menuitem" href={to} target="_blank" rel="noopener noreferrer" className="block px-4 py-2.5 text-sm hover:bg-blush">{label} ↗</a>
                      : <Link role="menuitem" to={to} className={`block px-4 py-2.5 text-sm hover:bg-blush ${to === pathname ? 'font-medium text-brand' : ''}`}>{label}</Link>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}

export default function EventPage() {
  const { id } = useParams()
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const [event, setEvent] = useState(undefined) // undefined = loading, null = not found
  const [error, setError] = useState('')

  const load = useCallback(() => {
    getMyEvent(id, user.id).then(setEvent).catch((e) => setError(e.message))
  }, [id, user.id])
  useEffect(() => { load() }, [load])
  useEffect(() => { document.title = `${event?.title ?? 'Event'} | TicketsGlobal` }, [event])

  if (error) return <p role="alert" className="rounded-xl bg-red-50 p-8 text-center text-red-700">{error}</p>
  if (event === undefined) return <div aria-busy="true" className="space-y-4"><div className="h-6 w-24 animate-pulse rounded bg-gray-100" /><div className="h-12 w-2/3 animate-pulse rounded bg-gray-100" /><div className="h-24 animate-pulse rounded bg-gray-100" /></div>
  if (event === null) return <div className="py-16 text-center"><p>We couldn't find that event.</p><Link to="/dashboard/events" className="mt-3 inline-block text-brand underline">Back to events</Link></div>

  const tz = event.timezone
  const when = formatWhen(event.starts_at, event.ends_at, tz)
  const weekday = new Date(`${fromIso(event.starts_at, tz).date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
  const publicPath = `/events/${event.custom_slug || event.id}`
  const start = Date.parse(event.starts_at), end = Date.parse(event.ends_at ?? event.starts_at), now = Date.now()

  let note, link
  if (event.status !== 'published') { note = "This event isn't live yet, so nobody can buy tickets."; link = [`/dashboard/events/${id}/settings`, 'Publish it in Settings'] }
  else if (now > end) { note = `This event ended ${span(now - end)} ago`; link = ['/dashboard/events/new', 'Create a new event'] }
  else if (now >= start) { note = 'This event is happening now'; link = [publicPath, 'View event page'] }
  else { note = `This event starts in ${span(start - now)}`; link = [publicPath, 'View event page'] }

  return (
    <div>
      <Link to="/dashboard/events" className="inline-flex items-center gap-1 text-sm hover:text-brand"><ChevronLeft size={16} />Back</Link>

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-3xl font-bold leading-tight">{event.title}</h1>
          <ul className="mt-6 space-y-4 text-ink/70">
            <li className="flex items-center gap-3"><CalendarDays size={20} className="shrink-0" />{weekday}, {formatDateLong(event.starts_at, tz)}</li>
            <li className="flex items-center gap-3"><Clock size={20} className="shrink-0" />{when.time}</li>
            <li className="flex items-center gap-3"><MapPin size={20} className="shrink-0" />{event.venue || event.city || 'No location yet'}</li>
          </ul>
        </div>
        <aside className="h-fit rounded-xl bg-gray-50 px-6 py-5 lg:w-96 lg:shrink-0">
          <p className="flex items-center gap-3 font-medium"><Info size={16} className="shrink-0 text-ink/50" />{note}</p>
          <Link to={link[0]} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"><span aria-hidden="true">•</span>{link[1]}</Link>
        </aside>
      </div>

      <Tabs groups={menu(id, publicPath)} pathname={pathname} />
      <Outlet context={{ event, reload: load }} />
    </div>
  )
}
