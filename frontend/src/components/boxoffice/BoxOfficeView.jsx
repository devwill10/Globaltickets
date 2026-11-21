import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Globe, AtSign, X, Users } from 'lucide-react'
import { cleanSettings, fontsHref } from '../../data/boxOffice'
import { safeHttpUrl, socialLinks } from '../../utils/safeUrl'
import { cleanHtml } from '../../utils/sanitize'
import { formatEventDate, formatPrice } from '../../utils/format'

const ICONS = { Website: Globe, Instagram: AtSign, X, Facebook: Users }
export const SAMPLE_EVENTS = [
  { id: 's1', title: "Let's paint together", date: new Date(Date.now() + 9 * 864e5).toISOString(), venue: 'Your venue, Lagos', price: 0, currency: 'NGN', sample: true },
  { id: 's2', title: 'An art adventure', date: new Date(Date.now() + 16 * 864e5).toISOString(), venue: 'Online', price: 0, currency: 'NGN', sample: true },
]

// Loads Google Fonts for the (allow-listed) fonts in use
function useFonts(names) {
  const key = names.join('|')
  useEffect(() => {
    const href = fontsHref(names)
    if (!href || document.querySelector(`link[data-bo-fonts="${href}"]`)) return
    const el = document.createElement('link')
    el.rel = 'stylesheet'; el.href = href; el.dataset.boFonts = href
    document.head.appendChild(el)
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
}

// The public box office page. Also used for live previews in the dashboard.
// box = { title, description, image_url, social }   events = [{ id, title, date, venue, price, currency, image }]
export default function BoxOfficeView({ box, events, theme = 'default', settings, compact = false }) {
  const s = cleanSettings(settings)
  useFonts(Object.values(s.fonts))
  const [open, setOpen] = useState(false)
  const [all, setAll] = useState(false)
  const ff = (k) => (s.fonts[k] ? { fontFamily: `"${s.fonts[k]}", system-ui, sans-serif` } : undefined)
  const img = safeHttpUrl(box.image_url)
  const logo = safeHttpUrl(s.logo_url)
  const night = theme === 'night'
  const links = socialLinks(box.social)
  const shown = all ? events : events.slice(0, 2)
  const textColor = night ? '#ffffff' : s.colors.body
  const pad = compact ? 'p-4' : 'p-6 md:p-10'

  const picture = img
    ? <img src={img} alt="" className="aspect-square w-full rounded-2xl object-cover" />
    : <div className="grid aspect-square w-full place-items-center rounded-2xl bg-gradient-to-br from-orange-300 via-yellow-300 to-green-400 text-xs text-ink/50">Box office image</div>

  const text = (centered) => (
    <div className={centered ? 'text-center' : ''}>
      <h1 className="text-2xl font-bold md:text-3xl" style={{ ...ff('header'), color: night ? '#fff' : undefined }}>{box.title || 'Your box office title'}</h1>
      <div className={`rich-text mt-4 text-sm ${open ? '' : 'line-clamp-3'}`} style={{ ...ff('body'), color: textColor }} dangerouslySetInnerHTML={{ __html: cleanHtml(box.description) }} />
      <button type="button" onClick={() => setOpen(!open)} className="mt-1 text-sm" style={{ ...ff('links'), color: s.colors.links }}>{open ? 'Read less' : 'Read more'}</button>
      {links.length > 0 && (
        <ul className={`mt-4 flex gap-3 ${centered ? 'justify-center' : ''}`}>
          {links.map((l) => { const Icon = ICONS[l.label] ?? Globe; return (
            <li key={l.label}><a href={l.href} target="_blank" rel="noopener noreferrer nofollow" aria-label={l.label} style={{ color: night ? '#fff' : s.colors.social }}><Icon size={20} /></a></li>) })}
        </ul>
      )}
    </div>
  )

  let hero
  if (theme === 'boxie') hero = (
    <div className="grid items-center gap-8 md:grid-cols-2">{text(false)}
      <div className="relative"><span aria-hidden="true" className="absolute -right-3 -top-3 h-full w-full rounded-2xl bg-[#fffbe0]" /><div className="relative">{picture}</div></div></div>)
  else if (theme === 'edge') hero = (
    <div className="grid items-center gap-8 md:grid-cols-2">{picture}{text(false)}</div>)
  else if (theme === 'night') hero = (
    <div className="grid items-center gap-8 rounded-2xl bg-black p-6 md:grid-cols-2 md:p-10">{text(false)}{picture}</div>)
  else hero = (
    <div><div className="rounded-2xl bg-[#fffbe0] p-6 md:p-10"><div className="mx-auto max-w-xs">{picture}</div></div><div className="mx-auto mt-8 max-w-2xl">{text(true)}</div></div>)

  return (
    <div className={`bg-white ${pad}`} style={{ color: s.colors.body }}>
      <div className="mb-6">{logo ? <img src={logo} alt={box.title || 'Logo'} className="h-10 w-auto object-contain" /> : <span className="text-2xl font-medium tracking-tight text-brand">ticketsglobal</span>}</div>
      {hero}

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-bold" style={ff('sectionTitle')}>Upcoming Events</h2>
          {events.length > 2 && <button type="button" onClick={() => setAll(!all)} className="text-xs font-bold" style={{ ...ff('sectionLink'), color: s.colors.links }}>{all ? 'See less' : 'See all'}</button>}
        </div>
        {events.length === 0 ? <p className="mt-4 text-sm text-ink/60">No upcoming events right now.</p> : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {shown.map((e) => {
              const inner = (
                <>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold" style={ff('eventTitle')}>{e.title}</h3>
                    <p className="mt-2 flex items-center gap-2 text-xs text-ink/70" style={ff('eventDetails')}><Calendar size={14} />{formatEventDate(e.date)}</p>
                    <p className="mt-1 flex items-center gap-2 truncate text-xs text-ink/70" style={ff('eventDetails')}><MapPin size={14} className="shrink-0" />{e.venue}</p>
                    <p className="mt-3 text-xs font-bold" style={{ ...ff('eventPrice'), color: s.colors.links }}>{formatPrice(e.price, e.currency)}</p>
                  </div>
                  {safeHttpUrl(e.image) ? <img src={safeHttpUrl(e.image)} alt="" className="h-24 w-24 shrink-0 rounded-lg object-cover" /> : <div className="h-24 w-24 shrink-0 rounded-lg bg-gradient-to-br from-orange-200 to-orange-400" />}
                </>)
              const cls = 'flex items-stretch gap-3 rounded-lg border border-ink/10 bg-white p-4 shadow-sm'
              return <li key={e.id}>{e.sample ? <div className={cls}>{inner}</div> : <Link to={`/events/${e.id}`} className={`${cls} hover:shadow-md`}>{inner}</Link>}</li>
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
