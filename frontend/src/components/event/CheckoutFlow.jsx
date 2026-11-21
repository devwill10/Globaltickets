import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ArrowLeft, Info } from 'lucide-react'
import { claimFreeTickets } from '../../services/publicEvent'
import { formatPrice, formatMoney } from '../../utils/format'
import { useAuthStore } from '../../store/authStore'

const MAX_PER_ORDER = 10
const HOLD_SECONDS = 10 * 60
const CODES = ['+234', '+233', '+254', '+27', '+44', '+1']
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const field = (err) => `w-full rounded-md border bg-[#eaf0fb] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-offset-0 ${err ? 'border-red-500' : 'border-ink/20'}`

export default function CheckoutFlow({ event, tiers, availability, color, onClose }) {
  const navigate = useNavigate()
  const authUser = useAuthStore((s) => s.user)
  const [step, setStep] = useState('tickets')
  const [qty, setQty] = useState({})
  const [c, setC] = useState({ first: '', last: '', email: '', email2: '', code: '+234', phone: '' })
  const [other, setOther] = useState(false)
  const [consent, setConsent] = useState(false) // never pre-ticked
  const [att, setAtt] = useState([])
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)
  const [deadline, setDeadline] = useState(0)
  const [left, setLeft] = useState(HOLD_SECONDS)
  const [notice, setNotice] = useState('')

  const items = useMemo(() => tiers.filter((t) => (qty[t.id] ?? 0) > 0).map((t) => ({ tier: t, qty: qty[t.id] })), [tiers, qty])
  const totalQty = items.reduce((s, i) => s + i.qty, 0)
  const subtotal = items.reduce((s, i) => s + (i.tier.price_minor / 100) * i.qty, 0)
  const hasPaid = items.some((i) => i.tier.price_minor > 0)
  const cur = event.currency

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc) }
  }, [onClose])

  // Session timer on the contact step. (Tickets are not held for you; availability is checked when you order.)
  useEffect(() => {
    if (step !== 'contact') return
    const end = Date.now() + HOLD_SECONDS * 1000
    setDeadline(end)
    const id = setInterval(() => {
      const s = Math.max(0, Math.round((end - Date.now()) / 1000))
      setLeft(s)
      if (s === 0) { setStep('tickets'); setNotice('Your session timed out. Please choose your tickets again.') }
    }, 1000)
    return () => clearInterval(id)
  }, [step])

  const maxFor = (t) => {
    const remaining = availability[t.id]
    const others = totalQty - (qty[t.id] ?? 0)
    return Math.max(0, Math.min(t.order_limit, remaining ?? MAX_PER_ORDER, MAX_PER_ORDER - others))
  }

  function goContact() {
    setNotice('')
    setC((x) => ({ ...x, email: x.email || authUser?.email || '', email2: x.email2 || authUser?.email || '' }))
    setStep('contact')
  }
  const setField = (k) => (e) => { setC((x) => ({ ...x, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: undefined })) }

  function validate() {
    const e = {}
    if (!c.first.trim()) e.first = 'Enter your first name.'
    if (!c.last.trim()) e.last = 'Enter your last name.'
    if (!EMAIL.test(c.email.trim())) e.email = 'Enter a valid email address.'
    if (c.email2.trim().toLowerCase() !== c.email.trim().toLowerCase()) e.email2 = 'Email addresses do not match.'
    const digits = c.phone.replace(/\D/g, '').replace(/^0+/, '')
    if (digits.length < 7 || digits.length > 12) e.phone = 'Enter a valid phone number.'
    if (other) for (let i = 0; i < totalQty; i++) if (!EMAIL.test((att[i] ?? '').trim())) e[`att${i}`] = 'Enter a valid email address.'
    return e
  }

  async function order() {
    const errs = validate()
    setErrors(errs); setServerError('')
    const key = Object.keys(errs)[0]
    if (key) { document.getElementById(`co-${key}`)?.focus(); return }
    // TODO: add bot protection here (e.g. Cloudflare Turnstile) and verify the token on the server.
    setBusy(true)
    try {
      const res = await claimFreeTickets({
        eventId: event.id,
        items: items.map((i) => ({ tier_id: i.tier.id, qty: i.qty })),
        first: c.first, last: c.last, email: c.email,
        phone: c.code + c.phone.replace(/\D/g, '').replace(/^0+/, ''),
        attendees: other ? Array.from({ length: totalQty }, (_, i) => ({ email: att[i].trim() })) : null,
        marketingConsent: consent,
      })
      onClose()
      navigate('/order-success', { state: { ...res, eventId: event.id, email: c.email.trim() } })
    } catch (e) { setServerError(e.message) } finally { setBusy(false) }
  }

  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0')
  const accent = { color }
  const btn = { backgroundColor: color }

  const summary = (
    <aside className="rounded-xl border border-ink/10 p-5 lg:sticky lg:top-6">
      <h3 className="text-center font-bold">{event.title}</h3>
      {items.length === 0 ? (
        <p className="mt-6 text-center text-sm text-ink/60">Please, choose a ticket type to continue</p>
      ) : (
        <>
          <ul className="mt-5 space-y-2 border-b border-ink/10 pb-4 text-sm text-ink/70">
            {items.map(({ tier, qty: q }) => (
              <li key={tier.id} className="flex justify-between gap-3"><span>{q} × {tier.name}</span><span>{formatPrice((tier.price_minor / 100) * q, cur)}</span></li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-b border-ink/10 pb-4 text-sm text-ink/70">
            <p className="flex justify-between"><span className="flex items-center gap-1">Service fees <Info size={12} aria-label="Fees apply to paid tickets only" /></span><span>{formatMoney(0, cur)}</span></p>
            <p className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal, cur)}</span></p>
          </div>
          <p className="mt-4 flex justify-between text-sm font-bold"><span>Total</span><span>{formatPrice(subtotal, cur)}</span></p>
          {hasPaid && <p role="alert" className="mt-3 text-xs text-red-600">Online payment for paid tickets is coming soon.</p>}
          {step === 'tickets'
            ? <button type="button" disabled={hasPaid} onClick={goContact} style={btn} className="mt-5 w-full rounded-md py-3 text-sm text-white disabled:opacity-50">Continue</button>
            : <button type="button" disabled={busy || hasPaid} onClick={order} style={btn} className="mt-5 w-full rounded-md py-3 text-sm text-white disabled:opacity-60">{busy ? 'Placing order…' : 'Order Ticket'}</button>}
        </>
      )}
    </aside>
  )

  return (
    <div role="dialog" aria-modal="true" aria-label="Checkout" className="fixed inset-0 z-50 overflow-y-auto bg-white">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="flex items-center justify-between"><h2 className="text-sm">Checkout</h2><button type="button" aria-label="Close checkout" onClick={onClose}><X size={22} /></button></div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div>
            <ol className="flex items-center gap-3 text-xs font-medium" aria-label="Checkout progress">
              <li className="flex items-center gap-2" style={accent}><span className="h-3 w-3 rounded-full" style={btn} />Tickets</li>
              <span className="h-px flex-1 bg-ink/15" />
              <li className="flex items-center gap-2" style={step === 'contact' ? accent : undefined}>
                <span className={`h-3 w-3 rounded-full border ${step === 'contact' ? '' : 'border-ink/40'}`} style={step === 'contact' ? btn : undefined} />Contact
              </li>
            </ol>

            <div className="mt-6 flex items-center gap-3">
              {step === 'contact' && <button type="button" aria-label="Back to tickets" onClick={() => setStep('tickets')} style={btn} className="grid h-6 w-6 place-items-center rounded text-white"><ArrowLeft size={14} /></button>}
              <h3 className="text-lg font-bold">{step === 'tickets' ? 'Choose Tickets' : 'Contact Information'}</h3>
            </div>

            {notice && <p role="alert" className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</p>}

            {step === 'tickets' ? (
              <ul className="mt-6 divide-y divide-ink/10 border-b border-ink/10">
                {tiers.map((t) => {
                  const max = maxFor(t), soldOut = availability[t.id] === 0
                  return (
                    <li key={t.id} className="flex items-start justify-between gap-4 py-5">
                      <div className="min-w-0">
                        <p className="text-sm font-bold">{t.name}{t.ticket_kind === 'group' && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-normal">Group of {t.group_size}</span>}</p>
                        <p className="mt-1 text-sm font-bold" style={accent}>{formatPrice(t.price_minor / 100, cur)}</p>
                        {t.description && <p className="mt-2 text-xs text-ink/70">{t.description}</p>}
                        {t.perks?.length > 0 && <ul className="mt-2 list-disc pl-4 text-xs text-ink/70">{t.perks.map((p) => <li key={p}>{p}</li>)}</ul>}
                      </div>
                      {soldOut ? <span className="text-sm text-ink/60">Sold out</span> : (
                        <select aria-label={`Quantity for ${t.name}`} value={qty[t.id] ?? 0} onChange={(e) => setQty((q) => ({ ...q, [t.id]: Number(e.target.value) }))}
                          className="rounded-md border border-ink/20 bg-white px-3 py-2 text-xs">
                          {Array.from({ length: max + 1 }, (_, n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      )}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="mt-4 space-y-4">
                <p className="rounded-md bg-[#eef6fd] px-4 py-3 text-xs">Please complete your checkout within <b style={accent}>{mm}:{ss}</b>.</p>
                {serverError && <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}
                {[['first', 'First name', 'given-name'], ['last', 'Last name', 'family-name'], ['email', 'Email address', 'email'], ['email2', 'Confirm email address', 'email']].map(([k, label, ac]) => (
                  <div key={k}>
                    <label htmlFor={`co-${k}`} className="mb-1 block text-xs"><span className="mr-1" style={accent}>*</span>{label}</label>
                    <input id={`co-${k}`} value={c[k]} onChange={setField(k)} autoComplete={ac} type={k.startsWith('email') ? 'email' : 'text'} maxLength={k.startsWith('email') ? 254 : 100}
                      aria-invalid={Boolean(errors[k])} className={field(errors[k])} />
                    {errors[k] && <p role="alert" className="mt-1 text-xs text-red-600">{errors[k]}</p>}
                  </div>
                ))}
                <div>
                  <label htmlFor="co-phone" className="mb-1 block text-xs"><span className="mr-1" style={accent}>*</span>Phone number</label>
                  <div className="flex gap-2">
                    <select aria-label="Country code" value={c.code} onChange={setField('code')} className="rounded-md border border-ink/20 bg-white px-2 py-2.5 text-sm">{CODES.map((x) => <option key={x}>{x}</option>)}</select>
                    <input id="co-phone" value={c.phone} onChange={setField('phone')} inputMode="tel" autoComplete="tel-national" maxLength={15} aria-invalid={Boolean(errors.phone)} className={field(errors.phone)} />
                  </div>
                  {errors.phone && <p role="alert" className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>

                <fieldset className="pt-4">
                  <legend className="text-sm font-bold">Send ticket to different email addresses?</legend>
                  <p className="mt-3 flex items-center gap-2 rounded-md border border-ink/10 px-3 py-2.5 text-xs text-ink/70"><Info size={14} />{other ? 'Each ticket will be sent to its own email address.' : 'Tickets will only be sent to the email address you provide here.'}</p>
                  <div className="mt-3 flex gap-5 text-xs">
                    {[['Yes', true], ['No', false]].map(([l, v]) => (
                      <label key={l} className="flex cursor-pointer items-center gap-1.5"><input type="radio" name="other" checked={other === v} onChange={() => setOther(v)} className="accent-[#1b9ad6]" />{l}</label>
                    ))}
                  </div>
                  {other && (
                    <div className="mt-4 space-y-3">
                      {Array.from({ length: totalQty }, (_, i) => (
                        <div key={i}>
                          <label htmlFor={`co-att${i}`} className="mb-1 block text-xs">Ticket {i + 1} email</label>
                          <input id={`co-att${i}`} type="email" value={att[i] ?? ''} onChange={(e) => { const a = [...att]; a[i] = e.target.value; setAtt(a); setErrors((er) => ({ ...er, [`att${i}`]: undefined })) }}
                            aria-invalid={Boolean(errors[`att${i}`])} className={field(errors[`att${i}`])} />
                          {errors[`att${i}`] && <p role="alert" className="mt-1 text-xs text-red-600">{errors[`att${i}`]}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </fieldset>

                <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-ink/10 px-3 py-3 text-xs">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0" style={{ accentColor: color }} />
                  <span><span className="font-medium">Keep me updated about future events from this organiser.</span><span className="mt-0.5 block text-ink/60">Optional. You'll still get your tickets either way, and you can unsubscribe from their emails at any time.</span></span>
                </label>
              </div>
            )}
          </div>
          <div><h3 className="mb-4 text-lg font-bold">Summary</h3>{summary}</div>
        </div>
      </div>
    </div>
  )
}
