import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Download } from 'lucide-react'
import { getEventSales, getAllAttendees, attendeesCsv, downloadCsv } from '../../../services/eventAdmin'
import { useToast } from '../../../components/Toast'
import { StatCard, Skeleton, ErrorBox, Th, useLoad } from './shared'
import { slug } from './EventAttendees'

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)

export default function EventReports() {
  const { event } = useOutletContext()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const { data, error, loading, reload } = useLoad(() => getEventSales(event.id), [event.id])
  if (loading) return <Skeleton />
  if (error) return <ErrorBox message={error} onRetry={reload} />

  const t = data.tiers
  const sum = (k) => t.reduce((a, r) => a + r[k], 0)
  const sold = sum('sold'), used = sum('checked_in'), door = sum('door')

  async function exportCsv() {
    setBusy(true)
    try { downloadCsv(`${slug(event.title)}-attendees.csv`, attendeesCsv(await getAllAttendees(event.id))) }
    catch (e) { toast(e.message, 'error') } finally { setBusy(false) }
  }

  return (
    <div>
      <div className="mt-10 grid gap-4 sm:grid-cols-4">
        <StatCard value={sold} label="Tickets sold" />
        <StatCard value={used} label="Checked in" />
        <StatCard value={sold - used} label="Yet to arrive" />
        <StatCard value={door} label="Sold at the door" />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between text-sm font-bold"><span>Attendance</span><span>{pct(used, sold)}%</span></div>
        <div role="progressbar" aria-label="Guests checked in" aria-valuenow={pct(used, sold)} aria-valuemin={0} aria-valuemax={100} className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct(used, sold)}%` }} />
        </div>
      </div>

      <h2 className="mt-12 text-xl font-bold">Check-ins by ticket</h2>
      <div className="mt-6 overflow-x-auto border-t border-ink/10">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-ink/10"><tr><Th>Ticket name</Th><Th>Sold</Th><Th>Checked in</Th><Th>Yet to arrive</Th><Th>Attendance</Th></tr></thead>
          <tbody>
            {t.map((r) => (
              <tr key={r.tier_id} className="border-b border-ink/10">
                <td className="px-3 py-5">{r.name}</td><td className="px-3 py-5">{r.sold}</td><td className="px-3 py-5">{r.checked_in}</td>
                <td className="px-3 py-5">{r.sold - r.checked_in}</td><td className="px-3 py-5">{r.sold ? `${pct(r.checked_in, r.sold)}%` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={exportCsv} disabled={busy} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm text-white hover:bg-brand-dark disabled:opacity-60"><Download size={16} />{busy ? 'Preparing…' : 'Download attendee list (CSV)'}</button>
    </div>
  )
}
