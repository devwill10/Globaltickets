import { useState } from 'react'
import { Info, ChevronUp, ChevronDown } from 'lucide-react'
import Modal from '../Modal'
import { Label, ErrorText, inputCls } from './FormBits'
import { TIMEZONES, toIso, fromIso } from '../../utils/eventTime'
import { CURRENCY_SYMBOL } from '../../data/eventOptions'
import { saveDiscount } from '../../services/discounts'

const blank = {
  code: '', kind: 'percent', value: '', startDate: '', startTime: '', startAmPm: 'AM',
  endDate: '', endTime: '', endAmPm: 'AM', usage: 'unlimited', maxUses: '', minMode: '', minTickets: '', minAmount: '',
}

function initial(d, tz) {
  if (!d) return blank
  const s = fromIso(d.starts_at, tz), e = d.ends_at ? fromIso(d.ends_at, tz) : { date: '', time: '', ampm: 'AM' }
  return {
    code: d.code, kind: d.kind, value: String(Number(d.value)), startDate: s.date, startTime: s.time, startAmPm: s.ampm,
    endDate: e.date, endTime: e.time, endAmPm: e.ampm, usage: d.usage_mode, maxUses: d.max_uses ? String(d.max_uses) : '',
    minMode: d.min_tickets ? 'tickets' : d.min_amount ? 'amount' : '',
    minTickets: d.min_tickets ? String(d.min_tickets) : '', minAmount: d.min_amount ? String(Number(d.min_amount)) : '',
  }
}

function Radio({ name, checked, onChange, disabled, children }) {
  return (
    <label className={`flex items-center gap-3 text-sm ${disabled ? 'opacity-60' : 'cursor-pointer'}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} disabled={disabled} className="sr-only peer" />
      <span aria-hidden="true" className={`h-5 w-5 shrink-0 rounded-full border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 ${checked ? 'border-brand bg-brand shadow-[inset_0_0_0_3px_white]' : 'border-ink/25'}`} />
      {children}
    </label>
  )
}

// discount = existing code to edit (omit to create). ctx = { currency, timezone }.
export default function DiscountModal({ discount, ctx, onClose, onSaved }) {
  const editing = Boolean(discount)
  const locked = editing && discount.used_count > 0
  const [v, setV] = useState(() => initial(discount, ctx.timezone))
  const [more, setMore] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)
  const sym = CURRENCY_SYMBOL[ctx.currency] ?? ''
  const zone = TIMEZONES.find((z) => z.value === ctx.timezone)

  const set = (k, val) => { setV((x) => ({ ...x, [k]: val })); setErrors((e) => ({ ...e, [k]: undefined })) }
  const on = (k) => (e) => set(k, e.target.value)
  const bad = (k) => ({ id: `d-${k}`, 'aria-invalid': Boolean(errors[k]), 'aria-describedby': errors[k] ? `de-${k}` : undefined })

  function validate() {
    const e = {}
    if (!/^[A-Za-z0-9_-]{3,30}$/.test(v.code.trim())) e.code = 'Use 3 to 30 letters, numbers, dashes or underscores.'
    const val = Number(v.value)
    if (!(val > 0)) e.value = 'Enter a discount value.'
    else if (v.kind === 'percent' && val > 100) e.value = 'A percentage cannot be more than 100.'
    if (!v.startDate) e.startDate = 'Choose a start date.'
    const s = toIso(v.startDate, v.startTime, v.startAmPm, ctx.timezone)
    if (v.startDate && !s) e.startTime = 'Use a time like 06:00.'
    if (v.endDate || v.endTime) {
      if (!v.endDate) e.endDate = 'Choose an end date.'
      else {
        const en = toIso(v.endDate, v.endTime, v.endAmPm, ctx.timezone)
        if (!en) e.endTime = 'Use a time like 11:30.'
        else if (s && new Date(en) <= new Date(s)) e.endDate = 'The end must be after the start.'
      }
    }
    if (v.usage === 'limited' && !(Number.isInteger(Number(v.maxUses)) && Number(v.maxUses) >= 1)) e.maxUses = 'Enter how many times it can be used.'
    if (v.minMode === 'tickets' && !(Number.isInteger(Number(v.minTickets)) && Number(v.minTickets) >= 1)) e.minTickets = 'Enter a minimum number of tickets.'
    if (v.minMode === 'amount' && !(Number(v.minAmount) > 0)) e.minAmount = 'Enter a minimum amount.'
    return e
  }

  async function submit(ev) {
    ev.preventDefault()
    const errs = validate()
    setErrors(errs); setServerError('')
    const key = Object.keys(errs)[0]
    if (key) { if (['maxUses', 'minTickets', 'minAmount'].includes(key)) setMore(true); setTimeout(() => document.getElementById(`d-${key}`)?.focus(), 0); return }
    setSaving(true)
    try { onSaved(await saveDiscount(v, ctx, discount?.id), !editing) }
    catch (e) { setServerError(e.message) } finally { setSaving(false) }
  }

  const dateRow = (p, label, required) => (
    <>
      <div>
        <Label htmlFor={`d-${p}Date`} required={required}>{label} date</Label>
        <div className="flex gap-2">
          <input {...bad(`${p}Date`)} type="date" value={v[`${p}Date`]} onChange={on(`${p}Date`)} className={inputCls(errors[`${p}Date`])} />
          {!required && v.endDate && <button type="button" aria-label="Clear end date and time" onClick={() => setV((x) => ({ ...x, endDate: '', endTime: '' }))} className="px-2 text-ink/60">×</button>}
        </div>
        <ErrorText id={`de-${p}Date`}>{errors[`${p}Date`]}</ErrorText>
      </div>
      <div>
        <Label htmlFor={`d-${p}Time`} required={required}>{label} time</Label>
        <div className="grid grid-cols-[1fr_110px] gap-3">
          <input {...bad(`${p}Time`)} value={v[`${p}Time`]} onChange={on(`${p}Time`)} placeholder={`${label} time (hh:mm)`} maxLength={5} inputMode="numeric" className={inputCls(errors[`${p}Time`])} />
          <select aria-label={`${label} AM or PM`} value={v[`${p}AmPm`]} onChange={on(`${p}AmPm`)} className={inputCls(false)}><option>AM</option><option>PM</option></select>
        </div>
        <ErrorText id={`de-${p}Time`}>{errors[`${p}Time`]}</ErrorText>
      </div>
    </>
  )

  return (
    <Modal title={editing ? 'Edit discount' : 'Create discount'} align="left" onClose={onClose}
      footer={
        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={onClose} className="rounded-lg bg-[#fdece8] py-3.5 text-sm text-brand hover:bg-[#fbdcd3]">Cancel</button>
          <button type="submit" form="discount-form" disabled={saving} className="rounded-lg bg-brand py-3.5 text-sm text-white hover:bg-brand-dark disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      }>
      <form id="discount-form" onSubmit={submit} noValidate className="space-y-5">
        {serverError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}
        {locked && <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">This code has been used, so its code and value can't be changed.</p>}

        <div>
          <Label htmlFor="d-code" required>Discount code</Label>
          <input {...bad('code')} value={v.code} onChange={on('code')} maxLength={30} disabled={locked} placeholder="Discount code" autoCapitalize="characters" className={inputCls(errors.code)} />
          <ErrorText id="de-code">{errors.code}</ErrorText>
        </div>

        <fieldset className="space-y-3" disabled={locked}>
          <legend className="mb-2 text-sm font-bold">Discount code type</legend>
          <Radio name="kind" checked={v.kind === 'percent'} onChange={() => set('kind', 'percent')} disabled={locked}>Percentage discount</Radio>
          <Radio name="kind" checked={v.kind === 'fixed'} onChange={() => set('kind', 'fixed')} disabled={locked}>Fixed value</Radio>
        </fieldset>

        <div>
          <Label htmlFor="d-value" required>Discount value</Label>
          <div className={`flex items-center overflow-hidden rounded-lg border ${errors.value ? 'border-red-500' : 'border-ink/20'}`}>
            <input {...bad('value')} value={v.value} onChange={on('value')} disabled={locked} inputMode="decimal" placeholder="Discount value" className="min-w-0 flex-1 px-4 py-3 text-sm outline-none disabled:bg-gray-100" />
            <span className="px-4 text-sm text-ink/60">{v.kind === 'percent' ? '%' : sym.trim() || ctx.currency}</span>
          </div>
          <ErrorText id="de-value">{errors.value}</ErrorText>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-bold">Discount duration</p>
          {dateRow('start', 'Start', true)}
          {dateRow('end', 'End', false)}
          <p className="text-xs text-ink/60">Times use {zone?.label ?? 'your time zone'}.</p>
        </div>

        <button type="button" onClick={() => setMore(!more)} aria-expanded={more} className="flex items-center gap-1.5 text-sm text-brand">
          {more ? <ChevronUp size={16} /> : <ChevronDown size={16} />} More Settings
        </button>

        {more && (
          <div className="space-y-6">
            <fieldset className="space-y-3">
              <legend className="mb-2 text-sm font-bold">Usage limits</legend>
              <Radio name="usage" checked={v.usage === 'unlimited'} onChange={() => set('usage', 'unlimited')}>Unlimited</Radio>
              <Radio name="usage" checked={v.usage === 'limited'} onChange={() => set('usage', 'limited')}>Limited amount of uses</Radio>
              {v.usage === 'limited' && (
                <div className="pl-8">
                  <input {...bad('maxUses')} aria-label="Number of uses" value={v.maxUses} onChange={on('maxUses')} inputMode="numeric" className={`${inputCls(errors.maxUses)} max-w-[160px]`} />
                  <ErrorText id="de-maxUses">{errors.maxUses}</ErrorText>
                </div>
              )}
              <Radio name="usage" checked={v.usage === 'single'} onChange={() => set('usage', 'single')}>One use only</Radio>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="mb-2 flex items-center gap-1.5 text-sm font-bold">Minimum requirements <Info size={13} className="text-brand" aria-label="The order must meet this to use the code" /></legend>
              <Radio name="min" checked={v.minMode === 'tickets'} onChange={() => set('minMode', 'tickets')}>Minimum quantity of tickets</Radio>
              {v.minMode === 'tickets' && (
                <div className="pl-8">
                  <input {...bad('minTickets')} aria-label="Minimum number of tickets" value={v.minTickets} onChange={on('minTickets')} inputMode="numeric" className={`${inputCls(errors.minTickets)} max-w-[160px]`} />
                  <ErrorText id="de-minTickets">{errors.minTickets}</ErrorText>
                </div>
              )}
              <Radio name="min" checked={v.minMode === 'amount'} onChange={() => set('minMode', 'amount')}>Minimum purchase amount</Radio>
              {v.minMode === 'amount' && (
                <div className="pl-8">
                  <input {...bad('minAmount')} aria-label="Minimum purchase amount" value={v.minAmount} onChange={on('minAmount')} inputMode="decimal" className={`${inputCls(errors.minAmount)} max-w-[160px]`} />
                  <ErrorText id="de-minAmount">{errors.minAmount}</ErrorText>
                </div>
              )}
              {v.minMode && <button type="button" onClick={() => set('minMode', '')} className="pl-8 text-xs text-brand underline">Clear minimum</button>}
            </fieldset>
          </div>
        )}
      </form>
    </Modal>
  )
}
