import { useCallback, useEffect, useState } from 'react'
import { Percent, Plus, Pencil, ClipboardCheck, MoreVertical } from 'lucide-react'
import DiscountModal from '../../components/dashboard/DiscountModal'
import ApplyDiscountModal from '../../components/dashboard/ApplyDiscountModal'
import { listDiscounts, getOrgContext, setDiscountActive, deleteDiscount } from '../../services/discounts'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../components/Toast'
import { formatDateLong } from '../../utils/eventTime'

function usageText(d) {
  if (d.usage_mode === 'limited') return `${d.used_count} / ${d.max_uses}`
  if (d.usage_mode === 'single') return `${d.used_count} / 1`
  return `${d.used_count} / ∞`
}

export default function Discounts() {
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const [rows, setRows] = useState(null)
  const [ctx, setCtx] = useState({ currency: 'NGN', timezone: 'Africa/Lagos' })
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // { type: 'form' | 'apply', discount? }
  const [menu, setMenu] = useState(null)

  const load = useCallback(async () => {
    try { const [d, c] = await Promise.all([listDiscounts(user.id), getOrgContext(user.id)]); setRows(d); setCtx(c); setError('') }
    catch (e) { setError(e.message) }
  }, [user.id])
  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menu])

  async function run(fn, ok) { try { await fn(); toast(ok); load() } catch (e) { toast(e.message, 'error') } }
  const ended = (d) => d.ends_at && new Date(d.ends_at) < new Date()

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Discounts</h1>
        {rows?.length > 0 && <button onClick={() => setModal({ type: 'form' })} className="rounded-lg bg-brand px-5 py-2.5 text-sm text-white hover:bg-brand-dark">Create discount</button>}
      </div>

      <div className="mt-8">
        {error ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 py-12 text-center text-red-700">{error} <button className="ml-2 underline" onClick={load}>Try again</button></div>
        ) : rows === null ? <div className="h-24 animate-pulse rounded-xl bg-gray-100" aria-busy="true" />
        : rows.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 px-6 py-14 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand text-white"><Percent size={30} /></span>
            <h2 className="mt-4 font-bold">You have no discounts!</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-ink/70">Click on the "Create discount" button below to create your first discount.</p>
            <button onClick={() => setModal({ type: 'form' })} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm text-white hover:bg-brand-dark"><Plus size={16} />Create discount</button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-gray-50 text-ink/70"><tr><th className="px-5 py-4 font-normal">Discount code</th><th className="px-5 py-4 font-normal">Usage</th><th className="px-5 py-4 font-normal">Ends</th><th className="px-5 py-4"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id} className="border-t border-ink/10">
                    <td className="px-5 py-5">
                      <span className="font-medium">{d.code}</span>
                      <span className="ml-2 text-xs text-ink/60">{d.kind === 'percent' ? `${Number(d.value)}% off` : `${d.currency} ${Number(d.value)} off`}</span>
                      {!d.is_active && <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs">Inactive</span>}
                      {d.is_active && ended(d) && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Expired</span>}
                    </td>
                    <td className="px-5 py-5">{usageText(d)}</td>
                    <td className="px-5 py-5">{d.ends_at ? formatDateLong(d.ends_at, ctx.timezone) : 'No end date'}</td>
                    <td className="relative px-5 py-5">
                      <div className="flex items-center justify-end gap-4 text-ink/70">
                        <button aria-label={`Edit ${d.code}`} onClick={() => setModal({ type: 'form', discount: d })} className="hover:text-brand"><Pencil size={17} /></button>
                        <button aria-label={`Apply ${d.code} to events`} onClick={() => setModal({ type: 'apply', discount: d })} className="hover:text-brand"><ClipboardCheck size={17} /></button>
                        <button aria-label={`More actions for ${d.code}`} aria-expanded={menu === d.id} onClick={(e) => { e.stopPropagation(); setMenu(menu === d.id ? null : d.id) }} className="text-brand"><MoreVertical size={17} /></button>
                      </div>
                      {menu === d.id && (
                        <div className="absolute right-5 top-14 z-10 w-40 rounded-lg border border-ink/10 bg-white py-1 text-sm shadow-lg">
                          <button className="block w-full px-4 py-2 text-left hover:bg-blush" onClick={() => run(() => setDiscountActive(d.id, !d.is_active), d.is_active ? 'Discount deactivated' : 'Discount activated')}>{d.is_active ? 'Deactivate' : 'Activate'}</button>
                          <button disabled={d.used_count > 0} title={d.used_count > 0 ? 'Used codes can only be deactivated' : undefined}
                            className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() => window.confirm(`Delete ${d.code}?`) && run(() => deleteDiscount(d.id), 'Discount deleted')}>Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal?.type === 'form' && (
        <DiscountModal discount={modal.discount} ctx={ctx} onClose={() => setModal(null)}
          onSaved={(saved, isNew) => { toast(isNew ? 'You created a discount code.' : 'Discount updated'); load(); setModal(isNew ? { type: 'apply', discount: saved } : null) }} />
      )}
      {modal?.type === 'apply' && (
        <ApplyDiscountModal discount={modal.discount} onClose={() => setModal(null)}
          onSaved={() => { toast('Discount assigned successfully'); setModal(null); load() }} />
      )}
    </div>
  )
}
