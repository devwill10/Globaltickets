import { useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { Copy, ExternalLink } from 'lucide-react'
import { setEventStatus, deleteEvent } from '../../../services/myEvents'
import { useToast } from '../../../components/Toast'

const BADGE = { draft: 'bg-gray-100 text-ink/70', published: 'bg-green-100 text-green-800', unpublished: 'bg-amber-100 text-amber-800' }

export default function EventSettings() {
  const { event, reload } = useOutletContext()
  const toast = useToast()
  const nav = useNavigate()
  const [busy, setBusy] = useState(false)
  const url = `${window.location.origin}/events/${event.custom_slug || event.id}`
  const live = event.status === 'published'

  async function run(fn, ok, after) {
    setBusy(true)
    try { await fn(); toast(ok); after ? after() : reload() } catch (e) { toast(e.message, 'error') } finally { setBusy(false) }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(url); toast('Link copied') }
    catch { toast('Could not copy. Select the link and copy it.', 'error') }
  }

  return (
    <div className="mt-10 max-w-2xl space-y-12">
      <section aria-labelledby="st-status">
        <h2 id="st-status" className="text-lg font-bold">Event status</h2>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink/10 p-5">
          <div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${BADGE[event.status] ?? BADGE.draft}`}>{event.status}</span>
            <p className="mt-3 text-sm text-ink/70">{live ? 'Your event is live. People can find it and buy tickets.' : 'Your event is not live. Publish it so people can buy tickets.'}</p>
          </div>
          <button type="button" disabled={busy} onClick={() => run(() => setEventStatus(event.id, live ? 'unpublished' : 'published'), live ? 'Event unpublished' : 'Event published')}
            className={`rounded-lg px-5 py-3 text-sm disabled:opacity-60 ${live ? 'border border-ink/20 hover:border-brand' : 'bg-brand text-white hover:bg-brand-dark'}`}>{live ? 'Unpublish' : 'Publish'}</button>
        </div>
        {!live && <p className="mt-2 text-xs text-ink/60">To publish you need a confirmed email, at least one ticket, and a payout account if any ticket is paid.</p>}
      </section>

      <section aria-labelledby="st-link">
        <h2 id="st-link" className="text-lg font-bold">Event link</h2>
        <div className="mt-4 flex gap-2">
          <input readOnly value={url} aria-label="Event link" onFocus={(e) => e.target.select()} className="min-w-0 flex-1 rounded-lg border border-ink/20 bg-gray-50 px-4 py-3 text-sm" />
          <button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-lg border border-ink/20 px-4 text-sm hover:border-brand hover:text-brand"><Copy size={15} />Copy</button>
          <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Open event page in a new tab" className="grid place-items-center rounded-lg border border-ink/20 px-4 hover:border-brand hover:text-brand"><ExternalLink size={16} /></a>
        </div>
        {!live && <p className="mt-2 text-xs text-ink/60">This link only works for the public once the event is published.</p>}
      </section>

      <section aria-labelledby="st-edit">
        <h2 id="st-edit" className="text-lg font-bold">Edit your event</h2>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {[['details', 'Details'], ['appearance', 'Appearance'], ['tickets', 'Tickets']].map(([p, label]) => (
            <Link key={p} to={`/dashboard/events/${event.id}/${p}`} className="rounded-lg border border-ink/20 px-5 py-3 hover:border-brand hover:text-brand">{label}</Link>
          ))}
        </div>
      </section>

      {event.status === 'draft' && (
        <section aria-labelledby="st-del">
          <h2 id="st-del" className="text-lg font-bold text-red-700">Delete event</h2>
          <p className="mt-2 text-sm text-ink/70">Drafts can be deleted for good. Events that have been published and sold tickets cannot be deleted.</p>
          <button type="button" disabled={busy} onClick={() => window.confirm('Delete this draft? This cannot be undone.') && run(() => deleteEvent(event.id), 'Draft deleted', () => nav('/dashboard/events'))}
            className="mt-4 rounded-lg border border-red-300 px-5 py-3 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60">Delete draft</button>
        </section>
      )}
    </div>
  )
}
