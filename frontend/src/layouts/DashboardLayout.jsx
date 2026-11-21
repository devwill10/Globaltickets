import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, Tag, Megaphone, Store, User, HelpCircle, LogOut, Ticket, Menu, X } from 'lucide-react'
import { ToastProvider } from '../components/Toast'
import { useAuthStore } from '../store/authStore'

const nav = [
  { to: 'events', label: 'Events', icon: CalendarDays },
  { to: 'discounts', label: 'Discounts', icon: Tag },
  { to: 'marketing', label: 'Marketing', icon: Megaphone },
  { to: 'box-office', label: 'Box office', icon: Store },
  { to: 'account', label: 'Account', icon: User },
]

export default function DashboardLayout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  useEffect(() => { setOpen(false) }, [pathname])

  const link = ({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${isActive ? 'font-medium text-brand' : 'text-ink hover:bg-gray-50'}`

  return (
    <ToastProvider>
      <div className="min-h-screen bg-white md:flex">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4 md:hidden">
          <Link to="/" className="text-xl font-medium text-brand">ticketsglobal</Link>
          <button aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} />}

        <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-ink/10 bg-white p-6 transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <Link to="/" className="text-2xl font-medium tracking-tight text-brand">ticketsglobal</Link>
          <nav className="mt-10 flex flex-col gap-1" aria-label="Dashboard">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={`/dashboard/${to}`} className={link}><Icon size={18} />{label}</NavLink>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-1">
            <Link to="/help" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-gray-50"><HelpCircle size={18} />Help</Link>
            <button onClick={async () => { await logout(); navigate('/') }}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-brand hover:bg-blush"><LogOut size={18} />Sign out</button>
            <NavLink to="/dashboard/tickets" className="mt-4 flex items-center justify-between rounded-lg bg-white px-4 py-4 text-sm font-bold shadow-md">
              My Tickets <Ticket size={16} className="text-brand" />
            </NavLink>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 md:px-10"><Outlet /></main>
      </div>
    </ToastProvider>
  )
}
