import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, Ticket, Pencil, Trash2, Lock } from 'lucide-react'
import WizardShell from '../../components/dashboard/WizardShell'
import TicketModal from '../../components/dashboard/TicketModal'
import { getMyEvent } from '../../services/myEvents'
import { listTiers, deleteTier } from '../../services/tickets'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../components/Toast'
import { formatPrice } from '../../utils/format'

export default function EventTicketsStep() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const [event, setEvent] = useState(null)
  const [tiers, setTiers] = useState([])
  const [missing, setMissing] = useState(false)
  const [modal, setModal] = useState(null) // null | { tier?: ticket }

  const load = useCallback(async () => {
    try {
      const ev = await getMyEvent(id, user.id)
      if (!ev) return setMissing(true)
      setEvent(ev); setTiers(await listTiers(id))
    } catch (e) { toast(e.message, 'error') }
  }, [id, user.id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [load])

  async function remove(t) {
    if (!window.confirm(`Delete "${t.name}"?`)) return
    try { await deleteTier(t.id); toast('Ticket deleted'); load() } catch (e) { toast(e.message, 'error') }
  }

  if (missing) return <p className="mt-10">We couldn't find that event.</p>
  const has = tiers.length > 0

  return (
    <WizardShell step={2} backTo={`/dashboard/events/${id}/appearance`}>
      <h1 className="mt-10 text-2xl font-bold">Set up tickets</h1>
      <div className="mt-6 border-b border-ink/10"><span className="inline-block border-b-2 border-brand pb-3 text-sm text-brand">Ticket details</span></div>
      <p className="mt-6 rounded-lg bg-gray-50 px-4 py-3 text-sm">We only charge a service fee on paid tickets. For more details, check our <Link to="/pricing" className="text-brand hover:underline">pricing page</Link>.</p>

      {!event ? <p className="mt-10 text-ink/60" role="status">Loading…</p> : !has ? (
        <div className="mt-8 rounded-2xl bg-gray-50 px-6 py-14 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-orange-100 text-brand"><Ticket size={32} /></span>
          <h2 className="mt-4 font-bold">Create your first ticket</h2>
          <p className="mt-2 text-sm text-ink/70">Set up paid and free tickets so people can attend your event.</p>
          <button type="button" onClick={() => setModal({})} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm text-white hover:bg-brand-dark"><Plus size={16} />Create ticket</button>
        </div>
      ) : (
        <div className="mt-8">
          <ul className="space-y-3">
            {tiers.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-ink/10 bg-white p-4">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-orange-100 text-brand"><Ticket size={20} /></span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-bold">
                    {t.name}
                    {t.ticket_kind === 'group' && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-normal text-indigo-800">Group of {t.group_size}</span>}
                    {t.is_invite_only && <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal"><Lock size={11} />Invite-only</span>}
                    {t.requires_approval && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-normal text-amber-800">Approval required</span>}
                  </p>
                  <p className="mt-1 text-sm text-ink/70">
                    {formatPrice(t.price_minor / 100, event.currency)} · {t.quantity == null ? 'Unlimited' : `${t.quantity} available`} · {t.ticket_kind === 'group' ? `admits ${t.group_size} people` : `max ${t.order_limit} per person`}
                  </p>
                </div>
                <button type="button" aria-label={`Edit ${t.name}`} onClick={() => setModal({ tier: t })} className="text-brand"><Pencil size={18} /></button>
                <button type="button" aria-label={`Delete ${t.name}`} onClick={() => remove(t)} className="text-brand"><Trash2 size={18} /></button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setModal({})} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink/20 py-5 text-sm text-brand hover:bg-blush"><Plus size={16} />Create ticket</button>
        </div>
      )}

      <div className="mt-12 flex justify-center gap-4">
        <button type="button" onClick={() => navigate('/dashboard/events')} className="rounded-lg bg-[#fdece8] px-8 py-3 text-sm text-brand hover:bg-[#fbdcd3]">Do it later</button>
        <button type="button" disabled={!has} onClick={() => { toast('Event saved'); navigate('/dashboard/events') }}
          className="rounded-lg bg-brand px-8 py-3 text-sm text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50">Continue</button>
      </div>

      {modal && event && (
        <TicketModal eventId={id} currency={event.currency} tier={modal.tier} sortOrder={tiers.length}
          onClose={() => setModal(null)} onSaved={() => { setModal(null); toast('Ticket saved'); load() }} />
      )}
    </WizardShell>
  )
}
