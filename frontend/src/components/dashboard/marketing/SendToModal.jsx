import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Users } from 'lucide-react'
import Modal from '../../Modal'
import { listEmailableEvents, listSegments } from '../../../services/marketing'
import { AUTO_SEGMENTS } from '../../../data/marketing'
import { formatEventDate } from '../../../utils/format'

const go = (navigate, audience, ref) => navigate(`/dashboard/marketing/new?audience=${audience}${ref ? `&ref=${encodeURIComponent(ref)}` : ''}`)

// Step 1: who to email. Steps 2: pick an event or a segment.
export default function SendToModal({ overview, userId, onClose }) {
  const navigate = useNavigate()
  const [stage, setStage] = useState('choose') // choose | event | segment
  const [events, setEvents] = useState(null)
  const [segments, setSegments] = useState(null)
  const [error, setError] = useState('')
  const total = overview?.total ?? 0

  useEffect(() => {
    if (stage === 'event' && events === null) listEmailableEvents(userId).then(setEvents).catch((e) => setError(e.message))
    if (stage === 'segment' && segments === null) listSegments(userId).then(setSegments).catch((e) => setError(e.message))
  }, [stage, events, segments, userId])

  const back = (
    <button type="button" onClick={() => { setStage('choose'); setError('') }} className="mb-4 inline-flex items-center gap-1 text-sm text-brand"><ChevronLeft size={16} />Back</button>
  )
  const row = 'flex w-full items-center justify-between gap-3 rounded-lg border border-ink/10 px-4 py-3 text-left text-sm hover:border-brand'

  return (
    <Modal title={stage === 'event' ? 'Choose an event' : stage === 'segment' ? 'Choose a segment' : 'Send email to'} onClose={onClose} width="max-w-2xl">
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {stage === 'choose' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <button type="button" onClick={() => setStage('event')} className="rounded-xl border border-ink/10 px-4 py-8 text-center hover:border-brand">
            <span className="block font-bold">Event attendees</span><span className="mt-2 block text-xs text-ink/70">Email attendees of a published upcoming event</span>
          </button>
          <button type="button" disabled={total === 0} onClick={() => go(navigate, 'subscribers')}
            className="rounded-xl border border-ink/10 px-4 py-8 text-center enabled:hover:border-brand disabled:cursor-not-allowed disabled:opacity-60">
            <span className="block font-bold">Subscribers</span>
            <span className="mt-2 block text-xs text-ink/70">{total === 0 ? "You don't have any subscribers yet" : `Email all ${total} of your subscribers`}</span>
          </button>
          <button type="button" onClick={() => setStage('segment')} className="rounded-xl border border-ink/10 px-4 py-8 text-center hover:border-brand">
            <span className="block font-bold">Segment</span><span className="mt-2 block text-xs text-ink/70">Email a prebuilt or custom segment of your subscribers</span>
          </button>
        </div>
      )}

      {stage === 'event' && (
        <div>{back}
          {events === null ? <p className="text-sm text-ink/60" role="status">Loading…</p>
          : events.length === 0 ? <p className="text-sm">You have no published upcoming events.</p>
          : <ul className="space-y-2">{events.map((e) => (
              <li key={e.id}><button type="button" className={row} onClick={() => go(navigate, 'event', e.id)}><span className="font-medium">{e.title}</span><span className="text-xs text-ink/60">{formatEventDate(e.starts_at)}</span></button></li>
            ))}</ul>}
        </div>
      )}

      {stage === 'segment' && (
        <div>{back}
          <ul className="space-y-2">
            {AUTO_SEGMENTS.map((s) => (
              <li key={s.key}><button type="button" className={row} onClick={() => go(navigate, 'segment', s.key)}>
                <span className="font-medium">{s.title}<span className="ml-2 rounded bg-blush px-1.5 py-0.5 text-[10px] font-normal text-brand">Auto</span></span>
                <span className="flex items-center gap-1 text-xs text-ink/60"><Users size={12} />{overview?.[s.key] ?? 0}</span></button></li>
            ))}
            {segments === null ? <li className="text-sm text-ink/60" role="status">Loading…</li> : segments.map((s) => (
              <li key={s.id}><button type="button" className={row} onClick={() => go(navigate, 'segment', s.id)}>
                <span className="font-medium">{s.name}</span>
                <span className="flex items-center gap-1 text-xs text-ink/60"><Users size={12} />{overview?.custom?.[s.id] ?? 0}</span></button></li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  )
}
