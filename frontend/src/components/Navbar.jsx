import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Search, ChevronDown, Menu, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const links = [
  { to: '/events', label: 'Discover events' },
  { to: '/how-it-works', label: 'How TicketsGlobal Works' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About us' },
]
const resources = [
  { to: '/blog', label: 'Blog' },
  { to: '/help', label: 'Help center' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [resOpen, setResOpen] = useState(false)
  const isLoggedIn = useAuthStore((s) => Boolean(s.user))
  // Home: transparent over the hero. Every other page: solid light navbar.
  const overHero = useLocation().pathname === '/'

  const hover = overHero ? 'hover:text-white/70' : 'hover:text-brand'
  const close = () => setOpen(false)

  const outlined = overHero
    ? 'border border-white hover:bg-white hover:text-ink'
    : 'border border-ink/30 hover:border-brand hover:text-brand'
  const filled = 'bg-brand font-medium text-white hover:bg-brand-dark'
  const btn = 'rounded-md px-5 py-2.5 text-sm'

  return (
    <header className={overHero ? 'absolute inset-x-0 top-0 z-30 text-white' : 'relative z-30 bg-white text-ink'}>
      <div className="mx-auto flex h-[88px] max-w-6xl items-center justify-between px-5">
        <Link to="/" className={`text-2xl font-medium tracking-tight ${overHero ? '' : 'text-brand'}`}>ticketsglobal</Link>

        <nav className="hidden items-center gap-8 text-sm lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) => (isActive && !overHero ? 'text-brand' : hover)}>{l.label}</NavLink>
          ))}
          <div className="relative" onMouseLeave={() => setResOpen(false)}>
            <button onClick={() => setResOpen(!resOpen)} onMouseEnter={() => setResOpen(true)}
              className={`flex items-center gap-1 ${hover}`}>
              Resources <ChevronDown size={14} />
            </button>
            {resOpen && (
              <div className="absolute left-0 top-full w-44 rounded-lg bg-white py-2 text-ink shadow-lg">
                {resources.map((r) => (
                  <Link key={r.to} to={r.to} className="block px-4 py-2 text-sm hover:bg-blush">{r.label}</Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <button aria-label="Search" className={`mr-1 ${hover}`}><Search size={20} /></button>
          {isLoggedIn ? (
            <Link to="/dashboard" className={`${btn} ${overHero ? outlined : filled}`}>Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className={`${btn} ${outlined}`}>Log in</Link>
              <Link to="/signup" className={`${btn} ${filled}`}>Sign up</Link>
            </>
          )}
        </div>

        <button className="lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className={`px-5 pb-6 lg:hidden ${overHero ? 'bg-ink/95' : 'border-t border-ink/10 bg-white'}`}>
          <div className="flex flex-col gap-4 py-2 text-base">
            {[...links, ...resources].map((l) => (
              <Link key={l.to} to={l.to} onClick={close}>{l.label}</Link>
            ))}
            {isLoggedIn ? (
              <Link to="/dashboard" onClick={close}
                className={`mt-2 rounded-md px-5 py-3 text-center ${overHero ? 'border border-white' : 'bg-brand text-white'}`}>
                Go to Dashboard
              </Link>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3">
                <Link to="/login" onClick={close}
                  className={`rounded-md px-5 py-3 text-center ${overHero ? 'border border-white' : 'border border-ink/30'}`}>
                  Log in
                </Link>
                <Link to="/signup" onClick={close} className="rounded-md bg-brand px-5 py-3 text-center text-white">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
