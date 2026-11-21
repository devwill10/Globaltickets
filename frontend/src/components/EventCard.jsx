import { Link } from 'react-router-dom'
import { Calendar, MapPin } from 'lucide-react'
import Poster from './Poster'
import { formatEventDate, formatPrice } from '../utils/format'

export default function EventCard({ event }) {
  return (
    <Link to={`/events/${event.id}`}
      className="flex items-stretch justify-between gap-4 rounded-lg border border-ink/10 bg-white p-4 shadow-sm hover:shadow-md">
      <div className="flex min-w-0 flex-col">
        <h3 className="truncate text-lg font-bold">{event.title}</h3>
        <p className="mt-3 flex items-center gap-2 text-sm text-ink/70"><Calendar size={18} />{formatEventDate(event.date)}</p>
        <p className="mt-2 flex min-w-0 items-center gap-2 text-sm text-ink/70">
          <MapPin size={18} className="shrink-0" /><span className="truncate">{event.venue}</span>
        </p>
        <p className="mt-auto pt-4 text-sm font-bold text-brand">{formatPrice(event.price, event.currency)}</p>
      </div>
      <Poster event={event} className="h-32 w-32 shrink-0 rounded-lg" />
    </Link>
  )
}
