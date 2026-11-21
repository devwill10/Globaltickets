import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import Modal from '../Modal'
import { listAssignableEvents, getAssignedEventIds, saveAssignments } from '../../services/discounts'
import { useAuthStore } from '../../store/authStore'
import { formatEventDate } from '../../utils/format'

// Choose where a code works: all your events, or specific ones that have paid tickets.
export default function ApplyDiscountModal({ discount, onClose, onSaved }) {
  const user = useAuthStore((s) => s.user)
  const [events, setEvents] = useState(null)
  const [all, setAll] = useState(discount.applies_to_all)
  const [picked, setPicked] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let off = false
    Promise.all([listAssignableEvents(user.id, discount), getAssignedEventIds(discount.id)])
      .then(([evs, ids]) => { if (!off) { setEvents(evs); setPicked(ids.filter((id) => evs.some((e) => e.id === id))) } })
      .catch((e) => !off && setError(e.message))
    return () => { off = true }
  }, [user.id, discount])

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  async function save() {
    setSaving(true); setError('')
    try { await saveAssignments(discount.id, all, picked); onSaved() } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  return (
    <Modal title="Apply discount code" align="left" width="max-w-md" onClose={onClose}
      footer={
        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={onClose} className="rounded-lg bg-[#fdece8] py-3.5 text-sm text-brand hover:bg-[#fbdcd3]">Do it later</button>
          <button type="button" onClick={save} disabled={saving || events === null} className="rounded-lg bg-brand py-3.5 text-sm text-white hover:bg-brand-dark disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      }>
      <p className="text-sm text-ink/80">Add codes to an event or tickets within an event.</p>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <label className="mt-5 flex cursor-pointer items-center gap-3 text-xs">
        <button type="button" role="switch" aria-checked={all} onClick={() => setAll(!all)}
          className={`relative h-5 w-10 shrink-0 rounded-full transition ${all ? 'bg-brand' : 'bg-gray-200'}`}>
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${all ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
        Apply to all current and future events.
      </label>

      <p className="mt-6 flex items-center gap-1.5 text-sm font-bold">or select specific valid events <Info size={13} className="text-brand" aria-label="Only events with paid tickets can use discount codes" /></p>
      <div className="mt-3">
        {events === null ? <p className="text-xs text-ink/60" role="status">Loading…</p>
        : events.length === 0 ? <p className="text-xs">No active events with paid tickets available to apply this discount code</p>
        : (
          <ul className={`space-y-2 ${all ? 'opacity-50' : ''}`}>
            {events.map((e) => (
              <li key={e.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink/10 p-3 text-sm">
                  <input type="checkbox" checked={picked.includes(e.id)} disabled={all} onChange={() => toggle(e.id)} className="mt-1 h-4 w-4 accent-[#fa6540]" />
                  <span><span className="block font-medium">{e.title}</span><span className="text-xs text-ink/60">{formatEventDate(e.starts_at)}</span></span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  )
}
