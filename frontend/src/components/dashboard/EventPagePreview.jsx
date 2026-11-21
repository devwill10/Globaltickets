import DOMPurify from 'dompurify'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { formatWhen } from '../../utils/eventTime'

// Preview of the public event page. `event` = { title, startsAt, endsAt, timezone, address, description, image }
export default function EventPagePreview({ event, theme = 'default', color = '#fa6540' }) {
  const when = formatWhen(event.startsAt, event.endsAt, event.timezone)
  const html = DOMPurify.sanitize(event.description || '', { ADD_ATTR: ['target'] })
  const split = theme === 'split'
  const wrap = { default: 'bg-white', mist: 'bg-white', split: 'bg-white', heritage: '' }[theme]

  return (
    <div className={`overflow-hidden rounded-xl border border-ink/10 ${wrap}`} style={theme === 'heritage' ? { backgroundColor: `${color}14` } : undefined}>
      {theme === 'mist' && event.image && (
        <div aria-hidden="true" className="h-20 bg-cover bg-center blur-md" style={{ backgroundImage: `url(${event.image})` }} />
      )}
      <div className={`grid gap-6 p-6 sm:grid-cols-[minmax(0,2fr)_3fr] ${split ? 'text-white' : ''}`} style={split ? { backgroundColor: color } : undefined}>
        {event.image
          ? <img src={event.image} alt="" className="aspect-[4/5] w-full rounded-lg object-cover" />
          : <div className="grid aspect-[4/5] w-full place-items-center rounded-lg bg-gray-100 text-xs text-ink/50">No image yet</div>}
        <div>
          <h3 className="text-xl font-bold">{event.title || 'Your event name'}</h3>
          <p className="mt-4 flex items-center gap-2 text-sm"><Calendar size={16} />{when.date || 'Date'}</p>
          <p className="mt-2 flex items-center gap-2 text-sm"><Clock size={16} />{when.time || 'Time'}</p>
          <p className="mt-2 flex items-start gap-2 text-sm"><MapPin size={16} className="mt-0.5 shrink-0" />{event.address || 'Location'}</p>
          <span className="mt-5 inline-block rounded-md px-5 py-2 text-sm text-white" style={{ backgroundColor: split ? '#161a2b' : color }}>Get a ticket</span>
        </div>
      </div>
      <div className="p-6">
        <h4 className="text-sm font-bold">About this event</h4>
        <div className="rich-text mt-2 text-sm" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}
