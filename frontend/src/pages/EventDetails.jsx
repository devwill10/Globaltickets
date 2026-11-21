import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Calendar, Clock, MapPin, ExternalLink, Play } from 'lucide-react'
import AppBanner from '../components/AppBanner'
import EventCard from '../components/EventCard'
import CheckoutFlow from '../components/event/CheckoutFlow'
import { getPublicEvent, listPublicTiers, getAvailability, listRelated } from '../services/publicEvent'
import { formatWhen } from '../utils/eventTime'
import { safeHttpUrl, socialLinks } from '../utils/safeUrl'
import { cleanHtml } from '../utils/sanitize'

export default function EventDetails() {
  const { key } = useParams()
  const [state, setState] = useState({ status: 'loading' })
  const [shown, setShown] = useState(0)
  const [checkout, setCheckout] = useState(false)

  useEffect(() => {
    let off = false
    setState({ status: 'loading' }); setShown(0)
    ;(async () => {
      try {
        const ev = await getPublicEvent(key)
        if (off) return
        if (!ev) return setState({ status: 'missing' })
        const [tiers, avail, related] = await Promise.all([
          listPublicTiers(ev.id), getAvailability(ev.id).catch(() => ({})), listRelated(ev).catch(() => []),
        ])
        if (!off) setState({ status: 'ready', ev, tiers: tiers.filter((t) => !t.is_invite_only), avail, related })
      } catch { if (!off) setState({ status: 'error' }) }
    })()
    return () => { off = true }
  }, [key])

  useEffect(() => {
    if (state.status === 'ready') document.title = `${state.ev.title} | TicketsGlobal`
    return () => { document.title = 'TicketsGlobal' }
  }, [state])

  if (state.status === 'loading') return <div className="mx-auto max-w-6xl px-5 py-16" aria-busy="true"><div className="h-96 animate-pulse rounded-2xl bg-gray-100" /></div>
  if (state.status !== 'ready') return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-3xl font-bold">{state.status === 'missing' ? 'Event not found' : "We couldn't load this event"}</h1>
      <p className="mt-3 text-ink/70">{state.status === 'missing' ? 'It may have been removed or the link is wrong.' : 'Please refresh the page and try again.'}</p>
      <Link to="/events" className="mt-8 inline-block rounded-md bg-brand px-8 py-3 text-sm text-white hover:bg-brand-dark">Discover events</Link>
    </div>
  )

  const { ev, tiers, avail, related } = state
  const color = ev.theme_color || '#fa6540'
  const when = formatWhen(ev.starts_at, ev.ends_at, ev.timezone)
  const media = (ev.media?.length ? ev.media : ev.image_url ? [{ type: 'image', url: ev.image_url }] : []).filter((m) => safeHttpUrl(m.url))
  const current = media[shown]
  const links = socialLinks(ev.social)
  const lineup = (ev.lineup ?? []).map((l) => ({ ...l, image_url: safeHttpUrl(l.image_url), link: l.link && safeHttpUrl(l.link) }))
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.venue || '')}`

  const ended = new Date(ev.ends_at ?? ev.starts_at) < new Date()
  const soldOut = tiers.length > 0 && tiers.every((t) => avail[t.id] === 0)
  let blocked = ''
  if (ev.status !== 'published') blocked = 'Not published yet'
  else if (ended) blocked = 'Event ended'
  else if (tiers.length === 0) blocked = 'No tickets available'
  else if (soldOut) blocked = 'Sold out'

  const split = ev.theme === 'split'
  return (
    <div className="relative overflow-hidden" style={ev.theme === 'heritage' ? { backgroundColor: `${color}14` } : undefined}>
      {ev.theme === 'mist' && current?.type === 'image' && (
        <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-0 h-80 scale-110 bg-cover bg-center opacity-30 blur-2xl" style={{ backgroundImage: `url(${current.url})` }} />
      )}
      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-6">
        <nav aria-label="Breadcrumb" className="text-xs text-ink/70"><Link to="/events" className="hover:underline">Discover</Link> / <span className="text-ink">{ev.title}</span></nav>
        {ev.status !== 'published' && <p role="status" className="mt-4 rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-800">Preview: this event is not published, so only you can see it.</p>}

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]">
          <div>
            {current ? (
              current.type === 'video'
                ? <video src={current.url} controls className="aspect-[4/5] w-full rounded-xl bg-black object-cover" />
                : <img src={current.url} alt="" className="aspect-[4/5] w-full rounded-xl object-cover" />
            ) : <div className="grid aspect-[4/5] w-full place-items-center rounded-xl bg-gray-100 text-sm text-ink/50">No image</div>}
            {media.length > 1 && (
              <div className="mt-3 flex gap-2">
                {media.map((m, i) => (
                  <button key={m.url} type="button" aria-label={`Show media ${i + 1}`} aria-pressed={i === shown} onClick={() => setShown(i)}
                    className={`h-16 w-14 overflow-hidden rounded-md border-2 ${i === shown ? '' : 'border-transparent opacity-70'}`} style={i === shown ? { borderColor: color } : undefined}>
                    {m.type === 'video' ? <span className="grid h-full place-items-center bg-ink text-white"><Play size={16} /></span> : <img src={m.url} alt="" className="h-full w-full object-cover" />}
                  </button>
                ))}
              </div>
            )}
            <button type="button" disabled={Boolean(blocked)} onClick={() => setCheckout(true)} style={{ backgroundColor: color }}
              className="mt-5 w-full rounded-md py-3.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              {blocked || 'Get a Ticket'}
            </button>
          </div>

          <div>
            <div className={split ? 'rounded-xl p-6 text-white' : ''} style={split ? { backgroundColor: color } : undefined}>
              <h1 className="text-2xl font-bold">{ev.title}</h1>
              <p className="mt-6 flex items-center gap-3 text-sm"><Calendar size={18} />{when.date}</p>
              <p className="mt-4 flex items-center gap-3 text-sm"><Clock size={18} />{when.time}</p>
              <p className="mt-4 flex items-start gap-3 text-sm"><MapPin size={18} className="mt-0.5 shrink-0" />{ev.venue}</p>
            </div>

            <section className="mt-8 border-t border-ink/10 pt-8">
              <h2 className="text-sm font-bold">About this event</h2>
              <div className="rich-text mt-4 max-w-2xl text-sm" dangerouslySetInnerHTML={{ __html: cleanHtml(ev.description) }} />
            </section>

            {lineup.length > 0 && (
              <section className="mt-8 border-t border-ink/10 pt-8">
                <h2 className="text-sm font-bold">{ev.lineup_title || 'Lineup'}</h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {lineup.map((l, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-3">
                      {l.image_url && <img src={l.image_url} alt="" className="h-14 w-14 rounded-lg object-cover" />}
                      <div className="min-w-0 text-sm">
                        <p className="font-bold">{l.name}{l.role && <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-normal">{l.role}</span>}</p>
                        {l.description && <p className="mt-0.5 text-xs text-ink/70">{l.description}</p>}
                        {l.link && <a href={l.link} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color }}>Profile</a>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-8"><AppBanner /></div>

            <section className="mt-10">
              <h2 className="text-sm font-bold">Directions</h2>
              <div className="mt-3 max-w-md rounded-xl border border-ink/10 bg-white p-4 text-sm">
                <p className="font-bold">{ev.venue}</p>
                {ev.location_tip && <p className="mt-1 text-ink/70">{ev.location_tip}</p>}
                <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium" style={{ color }}><ExternalLink size={14} />Open in Google Maps</a>
              </div>
            </section>

            {links.length > 0 && (
              <section className="mt-10 border-t border-ink/10 pt-8">
                <h2 className="text-sm font-bold">Contact Us</h2>
                <ul className="mt-3 flex flex-wrap gap-4 text-sm">
                  {links.map((l) => <li key={l.label}><a href={l.href} target="_blank" rel="noopener noreferrer nofollow" className="underline hover:opacity-80" style={{ color }}>{l.label}</a></li>)}
                </ul>
              </section>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-ink/10 pt-8">
            <h2 className="text-sm font-bold">Other Events You May Like</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">{related.map((e) => <EventCard key={e.id} event={e} />)}</div>
          </section>
        )}
      </div>

      {checkout && <CheckoutFlow event={ev} tiers={tiers} availability={avail} color={color} onClose={() => setCheckout(false)} />}
    </div>
  )
}
