import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Ticket } from 'lucide-react'
import TicketCard from '../../components/TicketCard'
import { listMyTickets } from '../../services/myTickets'
import { useAuthStore } from '../../store/authStore'

export default function MyTickets() {
  const user = useAuthStore((s) => s.user)
  const [tickets, setTickets] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let off = false
    listMyTickets(user).then((d) => !off && setTickets(d)).catch(() => !off && setError("We couldn't load your tickets. Please refresh."))
    return () => { off = true }
  }, [user])

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">My Tickets</h1>
      <div className="mt-8">
        {error ? <p role="alert" className="rounded-xl bg-red-50 py-10 text-center text-red-700">{error}</p>
        : tickets === null ? <div className="space-y-3" aria-busy="true">{[0, 1].map((i) => <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100" />)}</div>
        : tickets.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 px-6 py-14 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-orange-100 text-brand"><Ticket size={32} /></span>
            <h2 className="mt-4 font-bold">No tickets yet</h2>
            <p className="mt-2 text-sm text-ink/70">Tickets you get will show up here.</p>
            <Link to="/events" className="mt-6 inline-block rounded-lg bg-brand px-6 py-3 text-sm text-white hover:bg-brand-dark">Discover events</Link>
          </div>
        ) : (
          <ul className="space-y-4">{tickets.map((t) => <li key={t.id}><TicketCard ticket={t} event={t.event} /></li>)}</ul>
        )}
      </div>
    </div>
  )
}
