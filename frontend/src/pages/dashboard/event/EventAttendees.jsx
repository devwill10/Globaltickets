import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { getEventAttendees, getAllAttendees, attendeesCsv, downloadCsv } from '../../../services/eventAdmin'
import { useToast } from '../../../components/Toast'
import { ErrorBox, Th, useLoad } from './shared'

export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'event'

export default function EventAttendees() {
  const { event } = useOutletContext()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [busy, setBusy] = useState(false)
  useEffect(() => { const t = setTimeout(() => { setQ(search.trim()); setPage(1) }, 300); return () => clearTimeout(t) }, [search])

  const { data, error, loading, reload } = useLoad(() => getEventAttendees(event.id, { search: q, page }), [event.id, q, page])

  async function exportCsv() {
    setBusy(true)
    try { downloadCsv(`${slug(event.title)}-attendees.csv`, attendeesCsv(await getAllAttendees(event.id))) }
    catch (e) { toast(e.message, 'error') } finally { setBusy(false) }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-[240px] flex-1 items-center gap-3 rounded-lg border border-ink/20 px-4 py-3 focus-within:border-brand">
          <Search size={18} className="text-ink/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or order ID" aria-label="Search attendees" className="w-full bg-transparent text-sm outline-none" />
        </label>
        <button type="button" onClick={exportCsv} disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-ink/20 px-4 py-3 text-sm hover:border-brand hover:text-brand disabled:opacity-60"><Download size={16} />{busy ? 'Preparing…' : 'Export CSV'}</button>
      </div>

      {error ? <ErrorBox message={error} onRetry={reload} /> : (
        <>
          <div className="mt-6 overflow-x-auto border-t border-ink/10" aria-busy={loading}>
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-ink/10"><tr><Th>Name</Th><Th>Email</Th><Th>Ticket</Th><Th>Order ID</Th><Th>Status</Th><Th>Sold</Th></tr></thead>
              <tbody>
                {!loading && data?.rows.length === 0 && <tr><td colSpan={6} className="px-3 py-12 text-center text-ink/60">{q ? 'No guests match your search.' : 'No tickets have been sold yet.'}</td></tr>}
                {data?.rows.map((r) => (
                  <tr key={r.ticket_id} className="border-b border-ink/10 align-top">
                    <td className="px-3 py-4 font-medium">{r.holder_name}{r.buyer_name !== r.holder_name && <span className="block text-xs font-normal text-ink/50">Bought by {r.buyer_name}</span>}</td>
                    <td className="px-3 py-4 text-ink/80">{r.holder_email.endsWith('.invalid') ? '—' : r.holder_email}</td>
                    <td className="px-3 py-4">{r.tier_name}</td>
                    <td className="px-3 py-4 font-mono text-xs">{r.ref}</td>
                    <td className="px-3 py-4"><span className={`rounded-full px-3 py-1 text-xs font-medium ${r.status === 'used' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-ink/70'}`}>{r.status === 'used' ? 'Checked in' : 'Not checked in'}</span></td>
                    <td className="px-3 py-4 text-ink/70">{r.source === 'door' ? 'Door' : 'Online'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data && (
            <div className="mt-4 flex items-center justify-between text-sm text-ink/70">
              <span>{data.total} {data.total === 1 ? 'ticket' : 'tickets'}</span>
              <div className="flex items-center gap-4">
                <span>Page {page} of {data.pages}</span>
                <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(page - 1)} className="disabled:opacity-30"><ChevronLeft size={18} /></button>
                <button type="button" aria-label="Next page" disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="disabled:opacity-30"><ChevronRight size={18} /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
