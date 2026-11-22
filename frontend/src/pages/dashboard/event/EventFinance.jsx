import { useOutletContext } from 'react-router-dom'
import { getEventSales } from '../../../services/eventAdmin'
import { StatCard, Skeleton, ErrorBox, Th, money, useLoad } from './shared'

export default function EventFinance() {
  const { event } = useOutletContext()
  const { data, error, loading, reload } = useLoad(() => getEventSales(event.id), [event.id])
  if (loading) return <Skeleton />
  if (error) return <ErrorBox message={error} onRetry={reload} />

  const cur = data.currency, t = data.tiers
  const sum = (k) => t.reduce((a, r) => a + r[k], 0)
  const sold = sum('sold'), revenue = sum('revenue_minor'), door = sum('door')

  return (
    <div>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatCard value={sold} label={sold === 1 ? 'Ticket sold' : 'Tickets sold'} />
        <StatCard value={revenue > 0 ? money(revenue, cur) : '-'} label="Sales revenue" />
        <StatCard value={`${sum('checked_in')} / ${sold}`} label="Checked in" />
      </div>

      <h2 className="mt-12 text-xl font-bold">Sales</h2>
      <div className="mt-6 overflow-x-auto border-t border-ink/10">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-ink/10"><tr><Th>Ticket name</Th><Th>Total tickets sold</Th><Th>Total sales revenue</Th><Th>Fees</Th><Th>Net sales revenue</Th></tr></thead>
          <tbody>
            {t.length === 0 && <tr><td colSpan={5} className="px-3 py-10 text-center text-ink/60">No tickets have been created yet.</td></tr>}
            {t.map((r) => (
              <tr key={r.tier_id} className="border-b border-ink/10">
                <td className="px-3 py-6">{r.name}</td>
                <td className="px-3 py-6">{r.sold}{r.quantity != null && <span className="text-ink/50"> / {r.quantity}</span>}</td>
                <td className="px-3 py-6">{money(r.revenue_minor, cur)}</td>
                <td className="px-3 py-6">{money(r.fees_minor, cur)}</td>
                <td className="px-3 py-6">{money(r.net_minor, cur)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-ink/60">
        Revenue is worked out from ticket prices.{door > 0 && ` ${door} of the ${sold} tickets were sold at the door; your staff collected that money directly.`} Fees apply to paid online sales only.
      </p>
    </div>
  )
}
