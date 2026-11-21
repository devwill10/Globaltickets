import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Plus, SlidersHorizontal, MapPin } from 'lucide-react'
import { listMyEvents, setEventStatus, deleteEvent } from '../../services/myEvents'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../components/Toast'
import { formatEventDate } from '../../utils/format'
import { inputCls } from '../../components/dashboard/FormBits'

const TABS = ['All Events', 'Published', 'Drafts', 'Ended']
const isEnded = (e) => new Date(e.ends_at ?? e.starts_at) < new Date()
const state = (e) => (isEnded(e) && e.status === 'published' ? 'ended' : e.status)
const BADGE = { draft: 'bg-gray-100 text-ink/70', published: 'bg-green-100 text-green-800', unpublished: 'bg-amber-100 text-amber-800', ended: 'bg-gray-200 text-ink/70' }

export default function DashboardEvents() {
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const [events, setEvents] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('All Events')
  const [showFilter, setShowFilter] = useState(false)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('newest')
  const [busy, setBusy] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let off = false
    listMyEvents(user.id).then((d) => !off && setEvents(d)).catch((e) => !off && setError(e.message))
    return () => { off = true }
  }, [user.id, attempt])

  const shown = useMemo(() => {
    let l = events ?? []
    if (tab === 'Published') l = l.filter((e) => state(e) === 'published')
    if (tab === 'Drafts') l = l.filter((e) => ['draft', 'unpublished'].includes(e.status))
    if (tab === 'Ended') l = l.filter((e) => state(e) === 'ended')
    if (q.trim()) l = l.filter((e) => e.title.toLowerCase().includes(q.trim().toLowerCase()))
    const by = { newest: (a, b) => new Date(b.created_at) - new Date(a.created_at), oldest: (a, b) => new Date(a.created_at) - new Date(b.created_at), date: (a, b) => new Date(a.starts_at) - new Date(b.starts_at) }
    return [...l].sort(by[sort])
  }, [events, tab, q, sort])

  async function run(id, fn, ok) {
    setBusy(id)
    try { await fn(); toast(ok); setAttempt((a) => a + 1) } catch (e) { toast(e.message, 'error') } finally { setBusy(null) }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Events</h1>

      <div className="relative mt-8 flex items-center justify-between border-b border-ink/10">
        <div role="tablist" className="flex gap-6 sm:gap-8">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className={`-mb-px border-b-2 pb-4 text-sm ${tab === t ? 'border-brand font-medium text-brand' : 'border-transparent'}`}>{t}</button>
          ))}
        </div>
        <button onClick={() => setShowFilter(!showFilter)} aria-expanded={showFilter} className="mb-3 flex items-center gap-2 text-sm"><SlidersHorizontal size={16} />Filter</button>
        {showFilter && (
          <div className="absolute right-0 top-full z-10 mt-2 w-64 space-y-3 rounded-lg border border-ink/10 bg-white p-4 shadow-lg">
            <input aria-label="Search by name" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name" className={inputCls(false)} />
            <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} className={inputCls(false)}>
              <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="date">By event date</option>
            </select>
          </div>
        )}
      </div>

      <div className="mt-6">
        {error ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 py-12 text-center text-red-700">
            {error} <button className="ml-2 underline" onClick={() => { setError(''); setAttempt((a) => a + 1) }}>Try again</button>
          </div>
        ) : events === null ? (
          <div className="space-y-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />)}</div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 px-6 py-14 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-orange-100 text-brand"><CalendarDays size={32} /></span>
            <h2 className="mt-4 font-bold">Create your first event</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-ink/70">You're a few steps away from your first ticket sale. Let's make this happen.</p>
            <Link to="/dashboard/events/new" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm text-white hover:bg-brand-dark"><Plus size={16} />Create event</Link>
          </div>
        ) : shown.length === 0 ? (
          <p className="rounded-xl bg-gray-50 py-14 text-center text-sm text-ink/60">No events here yet.</p>
        ) : (
          <>
            <div className="mb-4 text-right">
              <Link to="/dashboard/events/new" className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm text-white hover:bg-brand-dark"><Plus size={16} />Create event</Link>
            </div>
            <ul className="space-y-3">
              {shown.map((e) => {
                const st = state(e)
                return (
                  <li key={e.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-ink/10 bg-white p-4">
                    {e.image_url ? <img src={e.image_url} alt="" className="h-16 w-16 rounded-lg object-cover" /> : <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-orange-200 to-orange-400" />}
                    <div className="min-w-0 flex-1">
                      <Link to={`/dashboard/events/${e.id}/details`} className="block truncate font-bold hover:text-brand">{e.title}</Link>
                      <p className="mt-1 text-sm text-ink/70">{formatEventDate(e.starts_at)}</p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-ink/70"><MapPin size={14} />{e.venue || 'No location'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-sm">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${BADGE[st]}`}>{st}</span>
                      <span className="text-xs text-ink/60">{e.tickets} ticket type{e.tickets === 1 ? '' : 's'}</span>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <Link to={`/dashboard/events/${e.id}/details`} className="rounded-lg border border-ink/20 px-3 py-2 hover:border-brand hover:text-brand">Edit</Link>
                      {(e.status === 'draft' || e.status === 'unpublished') && (
                        <button disabled={busy === e.id} onClick={() => run(e.id, () => setEventStatus(e.id, 'published'), 'Event published')}
                          className="rounded-lg bg-brand px-3 py-2 text-white hover:bg-brand-dark disabled:opacity-60">Publish</button>)}
                      {e.status === 'published' && (
                        <button disabled={busy === e.id} onClick={() => run(e.id, () => setEventStatus(e.id, 'unpublished'), 'Event unpublished')}
                          className="rounded-lg border border-ink/20 px-3 py-2 hover:border-brand disabled:opacity-60">Unpublish</button>)}
                      {e.status === 'draft' && (
                        <button disabled={busy === e.id} onClick={() => window.confirm('Delete this draft?') && run(e.id, () => deleteEvent(e.id), 'Draft deleted')}
                          className="rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 disabled:opacity-60">Delete</button>)}
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
