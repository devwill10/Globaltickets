import { Link } from 'react-router-dom'
import Poster from './Poster'
import { formatEventDate } from '../utils/format'

export default function HighlightedEventCard({ event }) {
  return (
    <Link to={`/events/${event.id}`}
      className="relative block aspect-[0.64] min-w-[230px] overflow-hidden rounded-3xl bg-black text-center text-white lg:min-w-0">
      <Poster event={event} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent px-4 pb-6 pt-24">
        <p className="text-xs font-medium uppercase tracking-wide">Highlighted event</p>
        <h3 className="mt-1 text-xl font-bold leading-tight">{event.title}</h3>
        <p className="mt-2 text-sm">{formatEventDate(event.date, true)}</p>
      </div>
    </Link>
  )
}
