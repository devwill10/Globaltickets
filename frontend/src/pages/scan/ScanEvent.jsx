import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Search, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react'
import { Guarded, Header, PrimaryButton, Pager } from './ScanShell'
import { listStaffEvents, listAttendees, dateTime, scanPath, getStaff, SigninError } from '../../services/scan'

// "2 * Regular, 1 * VIP"
function summary(tickets) {
  const counts = new Map()
  tickets.forEach((t) => counts.set(t.tier_name, (counts.get(t.tier_name) ?? 0) + 1))
  return [...counts].map(([name, n]) => `${n} * ${name}`).join(', ')
}

export default function ScanEvent() {
  const { id } = useParams()
  const nav = useNavigate()
  const [event, setEvent] = useState(null)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [page, setPage] = useState(1)
  const [desc, setDesc] = useState(false)
  const [open, setOpen] = useState(null)

  const fail = (e) => { if (e instanceof SigninError) nav(scanPath('/'), { replace: true }); else setError(e.message) }

  useEffect(() => {
    let off = false
    listStaffEvents().then((all) => { if (!off) setEvent(all.find((e) => e.id === id) ?? false) }).catch((e) => !off && fail(e))
    return () => { off = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => { const t = setTimeout(() => { setDebounced(search); setPage(1) }, 300); return () => clearTimeout(t) }, [search])

  useEffect(() => {
    let off = false
    setError('')
    listAttendees(id, { search: debounced, page, desc }).then((d) => !off && setData(d)).catch((e) => !off && fail(e))
    return () => { off = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, debounced, page, desc])

  return (
    <Guarded>
      <Header back />
      {event === false && <p className="mt-10 text-center text-ink/60">You can't view this event.</p>}
      {event && (
        <div className="mt-8">
          <h1 className="text-3xl font-bold leading-tight">{event.title}</h1>
          <p className="mt-2 text-ink/60">{dateTime(event.starts_at, event.timezone)}</p>
        </div>
      )}

      <div className="mt-8 border-b border-ink/10"><span className="inline-block border-b-2 border-brand pb-3 font-medium text-brand">Attendee List</span></div>

      <label className="mt-6 flex items-center gap-3 rounded-xl border border-ink/15 px-4 py-4 focus-within:border-brand">
        <Search size={18} className="text-ink/40" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or order ID" aria-label="Search attendees" className="w-full bg-transparent outline-none" />
      </label>

      <button type="button" onClick={() => { setDesc((d) => !d); setPage(1) }} className="mt-5 flex items-center gap-1 text-sm font-medium text-ink/60">
        Order Name {desc ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
      </button>

      <div className="mt-2 min-h-[34vh] border-t border-ink/10">
        {error && <p role="alert" className="py-8 text-center text-red-600">{error}</p>}
        {!error && !data && <p className="py-8 text-center text-ink/50">Loading…</p>}
        {data && !data.rows.length && <p className="py-8 text-center text-ink/50">{debounced ? 'No attendees match your search.' : 'No orders yet.'}</p>}
        <ul>
          {data?.rows.map((r) => {
            const done = r.tickets.filter((t) => t.status === 'used').length
            const isOpen = open === r.order_id
            return (
              <li key={r.order_id} className="border-b border-ink/10">
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : r.order_id)} className="flex w-full items-start justify-between gap-4 py-5 text-left">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{r.name}</p>
                    <p className="mt-1 text-ink/70">{summary(r.tickets)}</p>
                    {done > 0 && <p className="mt-1 text-sm font-medium text-green-700">{done} of {r.tickets.length} checked in</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-ink/70"><span>{r.ref}</span><ChevronDown size={16} className={isOpen ? 'rotate-180' : ''} /></div>
                </button>
                {isOpen && (
                  <ul className="mb-4 space-y-2 rounded-xl bg-ink/[0.03] p-3">
                    {r.tickets.map((t) => (
                      <li key={t.code}>
                        <Link to={scanPath(`/events/${id}/ticket/${t.code}`)} className="flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-3 text-sm hover:bg-blush">
                          <span className="min-w-0"><span className="block truncate font-medium">{t.holder_name}</span><span className="text-ink/60">{t.tier_name}</span></span>
                          <span className={`shrink-0 font-medium ${t.status === 'used' ? 'text-green-700' : 'text-ink/60'}`}>{t.status === 'used' ? 'Checked in' : 'Not checked in'}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <PrimaryButton className="mt-6" onClick={() => nav(scanPath(`/events/${id}/qr`))}>Scan QR code</PrimaryButton>
      {event && event.status === 'published' && getStaff()?.can_sell && (
        <button type="button" onClick={() => nav(scanPath(`/events/${id}/sell`))} className="mt-3 w-full rounded-xl border border-brand py-4 text-base font-semibold text-brand hover:bg-brand/5">Sell tickets</button>
      )}
      <div className="mt-4"><Pager page={page} pages={data?.pages ?? 1} onPage={setPage} /></div>
    </Guarded>
  )
}
