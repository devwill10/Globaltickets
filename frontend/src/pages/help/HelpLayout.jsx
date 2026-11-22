import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, MessageSquare } from 'lucide-react'
import SupportButton from '../../components/SupportButton'

// Wave pattern for the banner (inline SVG, so nothing external is loaded)
const WAVES = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='24'%3E%3Cpath d='M0 12 Q15 0 30 12 T60 12' fill='none' stroke='white' stroke-opacity='.09' stroke-width='2'/%3E%3C/svg%3E")`

export default function HelpLayout() {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const nav = useNavigate()
  const home = pathname === '/help' || pathname === '/help/'
  const [q, setQ] = useState(params.get('q') ?? '')

  useEffect(() => { if (home) setQ(params.get('q') ?? '') }, [home, params])
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  const onChange = (e) => {
    const v = e.target.value
    setQ(v)
    nav(v.trim() ? `/help?q=${encodeURIComponent(v)}` : '/help', { replace: home })
  }

  return (
    <div className="min-h-dvh bg-[#f4f5f7]">
      <header className="bg-brand text-white" style={{ backgroundImage: WAVES }}>
        <div className="mx-auto max-w-5xl px-5 pb-10 pt-5">
          <div className="flex items-start justify-between gap-4">
            <Link to="/help" className="text-3xl font-medium tracking-tight">ticketsglobal</Link>
            <Link to="/" className="rounded-md bg-white/20 px-4 py-2 text-sm hover:bg-white/30">Go to website</Link>
          </div>
          {home && <h1 className="mt-10 text-center text-2xl font-bold">How can we help you?</h1>}
          <form role="search" onSubmit={(e) => e.preventDefault()} className={`mx-auto max-w-xl ${home ? 'mt-5' : 'mt-6'}`}>
            <label htmlFor="help-search" className="sr-only">Search our help center</label>
            <div className="flex items-center gap-3 rounded-lg bg-white px-5 py-4 text-ink shadow-sm focus-within:ring-2 focus-within:ring-white/60">
              <Search size={18} className="shrink-0 text-ink/60" />
              <input id="help-search" value={q} onChange={onChange} placeholder="Search our help center…" autoComplete="off" className="w-full bg-transparent text-sm outline-none" />
            </div>
          </form>
        </div>
      </header>

      <main><Outlet /></main>

      <footer className="mt-16 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Not finding what you are looking for?</h2>
            <a href="mailto:support@ticketsglobal.com" className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm text-white hover:bg-brand-dark"><MessageSquare size={16} />Contact us</a>
          </div>
          <p className="mt-10 border-t border-ink/10 pt-6 text-xs text-ink/70">© {new Date().getFullYear()} TicketsGlobal Helpdesk</p>
        </div>
      </footer>
      <SupportButton />
    </div>
  )
}
