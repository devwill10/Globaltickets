import { QRCodeSVG } from 'qrcode.react'
import { Calendar, MapPin } from 'lucide-react'
import { formatWhen } from '../utils/eventTime'

// ticket: { code, tier_name | tier.name, holder_name, ... }   event: { title, starts_at, ends_at, timezone, venue } (optional)
export default function TicketCard({ ticket, event }) {
  const tierName = ticket.tier_name ?? ticket.tier?.name ?? 'Ticket'
  const group = ticket.ticket_kind === 'group' ? ticket.group_size : ticket.tier?.ticket_kind === 'group' ? ticket.tier.group_size : null
  const when = event ? formatWhen(event.starts_at, event.ends_at, event.timezone) : null
  return (
    <article className="flex flex-wrap items-center gap-6 rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
      <div className="rounded-lg border border-ink/10 bg-white p-2">
        <QRCodeSVG value={ticket.code} size={120} title={`QR code for ${tierName}`} />
      </div>
      <div className="min-w-0 flex-1">
        {event && <h3 className="truncate font-bold">{event.title}</h3>}
        <p className="mt-1 text-sm font-medium text-brand">{tierName}{group ? ` · admits ${group}` : ''}</p>
        <p className="mt-1 text-sm text-ink/70">{ticket.holder_name}</p>
        {when && <p className="mt-2 flex items-center gap-2 text-xs text-ink/70"><Calendar size={14} />{when.date}, {when.time}</p>}
        {event?.venue && <p className="mt-1 flex items-center gap-2 text-xs text-ink/70"><MapPin size={14} />{event.venue}</p>}
        <p className="mt-2 font-mono text-[11px] text-ink/50">{ticket.code.slice(0, 8).toUpperCase()}</p>
      </div>
    </article>
  )
}
