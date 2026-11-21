import { Link, Navigate, useLocation } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import TicketCard from '../components/TicketCard'
import AppBanner from '../components/AppBanner'
import { useAuthStore } from '../store/authStore'

// Reached right after ordering. The tickets come from the order result, so a refresh clears this page.
export default function OrderSuccess() {
  const { state } = useLocation()
  const user = useAuthStore((s) => s.user)
  if (!state?.tickets?.length) return <Navigate to="/events" replace />

  return (
    <div className="mx-auto max-w-xl px-5 py-16 text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-orange-100 text-brand"><ShoppingBag size={40} /></span>
      <h1 className="mt-6 text-2xl font-bold">Success!</h1>
      <p className="mt-6 text-sm">Your tickets for <b>{state.event_title}</b> are ready.</p>
      <p className="mt-3 text-sm text-ink/80">
        {user ? 'You can also find them any time in your dashboard under My Tickets.'
              : 'Tap Go to My Tickets and we will email you a sign-in link to see them any time. Take a screenshot of the QR codes below to be safe.'}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <Link to={user ? '/dashboard/tickets' : '/tickets/sign-in'} state={{ email: state.email }} className="rounded-md bg-brand py-3 text-sm text-white hover:bg-brand-dark">Go to My Tickets</Link>
        <Link to={state.eventId ? `/events/${state.eventId}` : '/events'} className="rounded-md bg-[#fdece8] py-3 text-sm text-brand hover:bg-[#fbdcd3]">Buy again</Link>
      </div>

      <ul className="mt-10 space-y-4 text-left">
        {state.tickets.map((t) => <li key={t.id}><TicketCard ticket={t} /></li>)}
      </ul>
      <div className="mt-10"><AppBanner /></div>
    </div>
  )
}
