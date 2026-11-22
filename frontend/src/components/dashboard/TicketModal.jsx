import { useState } from 'react'
import { Info, Plus, Trash2, Ticket } from 'lucide-react'
import Modal from '../Modal'
import { Label, ErrorText, SelectBox, inputCls } from './FormBits'
import { saveTier } from '../../services/tickets'
import { isoToLocal, zoneAbbr } from '../../utils/salesWindow'

const SYMBOL = { NGN: '₦', GHS: 'GH₵', KES: 'KSh ', ZAR: 'R' }
const LIMITS = Array.from({ length: 10 }, (_, i) => String(i + 1))
const GROUP_SIZES = Array.from({ length: 19 }, (_, i) => String(i + 2))

const initial = (t, tz) => ({
  salesStart: isoToLocal(t?.sales_start_at, tz),
  salesEnd: isoToLocal(t?.sales_end_at, tz),
  kind: t?.ticket_kind ?? 'single',
  groupSize: String(t?.group_size ?? 2),
  isPaid: t ? t.price_minor > 0 : false,
  price: t && t.price_minor > 0 ? String(t.price_minor / 100) : '',
  inviteOnly: t?.is_invite_only ?? false,
  name: t?.name ?? '',
  qtyMode: t && t.quantity == null ? 'unlimited' : 'limited',
  quantity: t?.quantity != null ? String(t.quantity) : '',
  orderLimit: String(t?.order_limit ?? 5),
  description: t?.description ?? '',
  perks: t?.perks?.length ? t.perks : [''],
  password: '', confirm: '',
  approval: t?.requires_approval ?? false,
})

// tier = existing ticket to edit (skips the type picker).
export default function TicketModal({ eventId, currency, timezone = 'Africa/Lagos', tier, sortOrder, onClose, onSaved }) {
  const [stage, setStage] = useState(tier ? 'form' : 'type')
  const [v, setV] = useState(() => initial(tier, timezone))
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)
  const editing = Boolean(tier)

  const set = (k, val) => { setV((x) => ({ ...x, [k]: val })); setErrors((e) => ({ ...e, [k]: undefined })) }
  const on = (k) => (e) => set(k, e.target.value)
  const bad = (k) => ({ id: `t-${k}`, 'aria-invalid': Boolean(errors[k]), 'aria-describedby': errors[k] ? `te-${k}` : undefined })

  function toggleInvite(checked) {
    setV((x) => ({ ...x, inviteOnly: checked, orderLimit: checked ? '1' : '5' }))
  }

  function validate() {
    const e = {}
    if (!v.name.trim()) e.name = 'Enter a ticket name.'
    if (v.qtyMode === 'limited' && !(Number.isInteger(Number(v.quantity)) && Number(v.quantity) >= 1)) e.quantity = 'Enter how many tickets are available.'
    if (!v.description.trim()) e.description = 'Add a ticket description.'
    if (v.salesStart && v.salesEnd && v.salesEnd <= v.salesStart) e.salesEnd = 'Sales must end after they start.'
    if (v.isPaid && !(Number(v.price) >= 1)) e.price = 'Enter a price of 1 or more.'
    if (v.inviteOnly) {
      if (!editing || v.password) {
        if (v.password.length < 6) e.password = 'Use at least 6 characters.'
        else if (v.confirm !== v.password) e.confirm = 'Passwords do not match.'
      }
    }
    return e
  }

  async function submit(ev) {
    ev.preventDefault()
    const errs = validate()
    setErrors(errs); setServerError('')
    const key = Object.keys(errs)[0]
    if (key) { document.getElementById(`t-${key}`)?.focus(); return }
    setSaving(true)
    try { await saveTier(eventId, v, tier?.id, sortOrder, timezone); onSaved() }
    catch (e) { setServerError(e.message) } finally { setSaving(false) }
  }

  if (stage === 'type') {
    const options = [
      ['single', 'Single ticket', 'This ticket admits one person.'],
      ['group', 'Group ticket', 'This ticket admits more than one person.'],
    ]
    return (
      <Modal title="Create ticket" onClose={onClose}
        footer={<button type="button" onClick={() => setStage('form')} className="w-full rounded-lg bg-brand py-3.5 text-sm text-white hover:bg-brand-dark">Continue</button>}>
        <div role="radiogroup" aria-label="Ticket type" className="grid grid-cols-2 gap-4">
          {options.map(([id, title, text]) => {
            const on = v.kind === id
            return (
              <label key={id} className={`flex cursor-pointer flex-col items-center rounded-lg border px-3 py-8 text-center focus-within:ring-2 focus-within:ring-brand/40 ${on ? 'border-brand' : 'border-ink/15 hover:border-ink/40'}`}>
                <input type="radio" name="kind" value={id} checked={on} onChange={() => set('kind', id)} className="sr-only" />
                <Ticket size={44} strokeWidth={1.3} className={on ? 'text-brand' : 'text-indigo-300'} />
                <span className={`mt-4 font-bold ${on ? 'text-brand' : ''}`}>{title}</span>
                <span className={`mt-2 text-sm ${on ? 'text-brand' : ''}`}>{text}</span>
                <span aria-hidden="true" className={`mt-5 h-5 w-5 rounded-full border-2 ${on ? 'border-brand bg-brand shadow-[inset_0_0_0_3px_white]' : 'border-ink/20'}`} />
              </label>
            )
          })}
        </div>
      </Modal>
    )
  }

  const sym = SYMBOL[currency] ?? ''
  const group = v.kind === 'group'
  return (
    <Modal title={`${editing ? 'Edit' : 'Create'} ${group ? 'group' : 'single'} ticket`} onClose={onClose}
      footer={
        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={onClose} className="rounded-lg bg-[#fdece8] py-3.5 text-sm text-brand hover:bg-[#fbdcd3]">Cancel</button>
          <button type="submit" form="ticket-form" disabled={saving} className="rounded-lg bg-brand py-3.5 text-sm text-white hover:bg-brand-dark disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      }>
      <form id="ticket-form" onSubmit={submit} noValidate className="space-y-5">
        {serverError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}

        <div>
          <p className="mb-2 text-sm font-bold">What type of ticket is it?</p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {[['Free', false], ['Paid', true]].map(([label, paid]) => (
              <button key={label} type="button" aria-pressed={v.isPaid === paid} onClick={() => set('isPaid', paid)}
                className={`rounded-lg border px-8 py-3 ${v.isPaid === paid ? 'border-transparent bg-blush text-brand' : 'border-ink/20'}`}>{label}</button>
            ))}
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={v.inviteOnly} onChange={(e) => toggleInvite(e.target.checked)} className="h-4 w-4 accent-[#fa6540]" />Invite-only
            </label>
          </div>
        </div>

        {v.isPaid && (
          <div>
            <Label htmlFor="t-price" required>Price</Label>
            <div className={`flex overflow-hidden rounded-lg border ${errors.price ? 'border-red-500' : 'border-ink/20'}`}>
              <span className="border-r border-ink/20 bg-gray-50 px-4 py-3 text-sm">{sym || currency}</span>
              <input {...bad('price')} value={v.price} onChange={on('price')} inputMode="decimal" placeholder="0.00" className="min-w-0 flex-1 px-4 py-3 text-sm outline-none" />
            </div>
            <ErrorText id="te-price">{errors.price}</ErrorText>
          </div>
        )}

        <div>
          <div className="flex justify-between"><Label htmlFor="t-name" required>Ticket name</Label><span className="text-xs text-ink/60">{v.name.length}/75</span></div>
          <input {...bad('name')} value={v.name} maxLength={75} onChange={on('name')} placeholder="Ticket name" className={inputCls(errors.name)} />
          <ErrorText id="te-name">{errors.name}</ErrorText>
        </div>

        <div>
          <Label htmlFor="t-quantity" required>Ticket quantity</Label>
          <div className="grid grid-cols-2 gap-3">
            <SelectBox id="t-qtyMode" value={v.qtyMode} onChange={(x) => set('qtyMode', x)} placeholder=""
              options={[{ value: 'limited', label: 'Limited quantity' }, { value: 'unlimited', label: 'Unlimited' }]} />
            {v.qtyMode === 'limited' && <input {...bad('quantity')} value={v.quantity} onChange={on('quantity')} inputMode="numeric" aria-label="Number of tickets" className={inputCls(errors.quantity)} />}
          </div>
          <ErrorText id="te-quantity">{errors.quantity}</ErrorText>
        </div>

        <div>
          <p className="text-sm font-bold">Sales window <span className="font-normal text-ink/60">(optional)</span></p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="t-salesStart">Sales start</Label>
              <input id="t-salesStart" type="datetime-local" value={v.salesStart} onChange={on('salesStart')} className={inputCls(false)} />
            </div>
            <div>
              <Label htmlFor="t-salesEnd">Sales end</Label>
              <input {...bad('salesEnd')} type="datetime-local" value={v.salesEnd} onChange={on('salesEnd')} className={inputCls(errors.salesEnd)} />
            </div>
          </div>
          <ErrorText id="te-salesEnd">{errors.salesEnd}</ErrorText>
          <p className="mt-2 text-xs text-ink/60">Times are in the event's time zone ({zoneAbbr(timezone)}). Leave them empty to sell from now until the event ends. Staff can still sell at the door outside this window.</p>
        </div>

        {group ? (
          <div>
            <Label htmlFor="t-groupSize" required>Group size</Label>
            <SelectBox id="t-groupSize" value={v.groupSize} onChange={(x) => set('groupSize', x)} options={GROUP_SIZES} placeholder="" />
          </div>
        ) : (
          <div>
            <Label htmlFor="t-orderLimit" required>Order limit (per person)</Label>
            <SelectBox id="t-orderLimit" value={v.orderLimit} onChange={(x) => set('orderLimit', x)} options={LIMITS} placeholder="" disabled={v.inviteOnly} />
          </div>
        )}

        <div>
          <div className="flex justify-between"><Label htmlFor="t-description" required>Ticket description</Label><span className="text-xs text-ink/60">{v.description.length}/280</span></div>
          <textarea {...bad('description')} value={v.description} maxLength={280} onChange={on('description')} placeholder="Ticket description" rows={4} className={inputCls(errors.description)} />
          <ErrorText id="te-description">{errors.description}</ErrorText>
        </div>

        <div>
          <Label htmlFor="t-perk-0">Perks for this ticket</Label>
          <div className="space-y-3">
            {v.perks.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <input id={`t-perk-${i}`} value={p} maxLength={100} placeholder="Perk details" className={inputCls(false)}
                  onChange={(e) => set('perks', v.perks.map((x, j) => (j === i ? e.target.value : x)))} />
                <button type="button" aria-label="Remove perk" className="text-brand"
                  onClick={() => set('perks', v.perks.length > 1 ? v.perks.filter((_, j) => j !== i) : [''])}><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
          {v.perks.length < 10 && (
            <button type="button" onClick={() => set('perks', [...v.perks, ''])} className="mt-3 inline-flex items-center gap-1 text-sm text-brand"><Plus size={14} />Add another perk</button>
          )}
        </div>

        {v.inviteOnly && (
          <>
            <div>
              <Label htmlFor="t-password" required={!editing}>Password</Label>
              <input {...bad('password')} type="password" value={v.password} onChange={on('password')} autoComplete="new-password" placeholder="Password" className={inputCls(errors.password)} />
              {editing && <p className="mt-1 text-xs text-ink/60">Leave blank to keep the current password.</p>}
              <ErrorText id="te-password">{errors.password}</ErrorText>
            </div>
            <div>
              <Label htmlFor="t-confirm" required={!editing}>Confirm password</Label>
              <input {...bad('confirm')} type="password" value={v.confirm} onChange={on('confirm')} autoComplete="new-password" placeholder="Confirm password" className={inputCls(errors.confirm)} />
              <ErrorText id="te-confirm">{errors.confirm}</ErrorText>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={v.approval} onChange={(e) => set('approval', e.target.checked)} className="h-4 w-4 accent-[#fa6540]" />
              Require approval for this ticket
              <Info size={14} className="text-brand" aria-label="Buyers must be approved by you before they receive their ticket" />
            </label>
          </>
        )}
      </form>
    </Modal>
  )
}
