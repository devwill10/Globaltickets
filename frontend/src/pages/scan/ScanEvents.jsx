import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, User, LogOut } from 'lucide-react'
import { Guarded, Header, Pager } from './ScanShell'
import { listStaffEvents, getStaff, clearStaff, eventState, dateOnly, scanPath, SigninError } from '../../services/scan'

const PER_PAGE = 10

export default function ScanEvents() {
  const nav = useNavigate()
  const [events, setEvents] = useState(null)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [menu, setMenu] = useState(false)
  const menuRef = useRef(null)
  const staff = getStaff()

  useEffect(() => {
    let off = false
    listStaffEvents().then((e) => !off && setEvents(e)).catch((e) => {
      if (e instanceof SigninError) nav(scanPath('/'), { replace: true }); else if (!off) setError(e.message)
    })
    return () => { off = true }
  }, [nav])

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const filtered = useMemo(() => (events ?? []).filter((e) => e.title.toLowerCase().includes(q.trim().toLowerCase())), [events, q])
  const pages = Math.max(Math.ceil(filtered.length / PER_PAGE), 1)
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const signOut = () => { clearStaff(); nav(scanPath('/'), { replace: true }) }

  return (
    <Guarded>
      <Header title="Events" right={
        <div className="relative" ref={menuRef}>
          <button type="button" aria-label="Account" aria-expanded={menu} onClick={() => setMenu((m) => !m)} className="p-1"><User size={24} /></button>
          {menu && (
            <div className="absolute right-0 top-10 z-10 w-56 rounded-xl border border-ink/10 bg-white p-2 shadow-lg">
              <p className="truncate px-3 py-2 text-sm text-ink/60">Signed in as <strong className="text-ink">{staff?.name}</strong></p>
              <button type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink/5"><LogOut size={16} />Sign out</button>
            </div>
          )}
        </div>
      } />

      <label className="mt-8 flex items-center gap-3 rounded-xl border border-ink/15 px-4 py-4 focus-within:border-brand">
        <Search size={18} className="text-ink/40" />
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder="Search for event by title" aria-label="Search for event by title" className="w-full bg-transparent outline-none" />
      </label>

      <div className="mt-6 min-h-[50vh]">
        {error && <p role="alert" className="py-8 text-center text-red-600">{error}</p>}
        {!error && events === null && <p className="py-8 text-center text-ink/50">Loading…</p>}
        {events && !shown.length && <p className="py-8 text-center text-ink/50">{events.length ? 'No events match your search.' : 'No events have been assigned to you yet.'}</p>}
        <ul>
          {shown.map((e) => {
            const st = eventState(e)
            return (
              <li key={e.id} className="border-b border-ink/10">
                <Link to={scanPath(`/events/${e.id}`)} className="flex items-center justify-between gap-4 px-2 py-6 hover:bg-ink/[0.02]">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold">{e.title}</p>
                    <p className="mt-1 font-medium text-ink/60">{dateOnly(e.starts_at, e.timezone)}</p>
                  </div>
                  <span className={`shrink-0 rounded-lg px-4 py-2 text-sm ${st.cls}`}>{st.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="mt-4"><Pager page={page} pages={pages} onPage={setPage} /></div>
    </Guarded>
  )
}
