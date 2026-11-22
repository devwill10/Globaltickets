import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Guarded, Header, PrimaryButton } from './ScanShell'
import { getSellOptions, sellTickets, scanPath, SigninError } from '../../services/scan'
import { formatMoney, formatPrice } from '../../utils/format'

const MAX_TOTAL = 10
const inputCls = 'mt-1 w-full rounded-xl border border-ink/20 px-4 py-3 outline-none focus:border-brand'

function Body() {
  const { id } = useParams()
  const nav = useNavigate()
  const [opts, setOpts] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [qty, setQty] = useState({})
  const [f, setF] = useState({ first: '', last: '', email: '', phone: '' })
  const [method, setMethod] = useState('')
  const [checkIn, setCheckIn] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)

  const fail = (e) => { if (e instanceof SigninError) nav(scanPath('/'), { replace: true }); else return e.message }

  useEffect(() => {
    let off = false
    getSellOptions(id).then((o) => !off && setOpts(o)).catch((e) => { const m = fail(e); if (m && !off) setLoadError(m) })
    return () => { off = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const totalQty = Object.values(qty).reduce((a, b) => a + b, 0)
  const total = useMemo(() => (opts?.tiers ?? []).reduce((sum, t) => sum + t.price_minor * (qty[t.id] ?? 0), 0), [opts, qty])
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const maxFor = (t) => Math.max(0, Math.min(t.remaining ?? MAX_TOTAL, MAX_TOTAL - (totalQty - (qty[t.id] ?? 0))))

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    setError('')
    if (!totalQty) return setError('Choose at least one ticket.')
    if (!f.first.trim() || !f.last.trim()) return setError("Enter the guest's first and last name.")
    if (total > 0 && !method) return setError('Choose how the guest paid.')
    setBusy(true)
    try {
      const res = await sellTickets({
        eventId: id, first: f.first, last: f.last, email: f.email, phone: f.phone,
        items: opts.tiers.filter((t) => qty[t.id] > 0).map((t) => ({ tier_id: t.id, qty: qty[t.id] })),
        method: total > 0 ? method : null, checkIn: opts.can_check_in && checkIn,
      })
      setDone({ ...res, email: f.email.trim(), checkedIn: opts.can_check_in && checkIn })
    } catch (err) { const m = fail(err); if (m) setError(m) } finally { setBusy(false) }
  }

  function again() { setDone(null); setQty({}); setF({ first: '', last: '', email: '', phone: '' }); setMethod(''); setError('') }

  if (done) {
    return (
      <div className="mt-10 text-center">
        <h1 className="text-2xl font-bold">Sold!</h1>
        <p className="mt-3 text-ink/80">{done.tickets.length} {done.tickets.length === 1 ? 'ticket' : 'tickets'} for {f.first.trim()} {f.last.trim()}{done.total_minor > 0 ? ` · ${formatMoney(done.total_minor / 100, done.currency)}` : ''}</p>
        <p className="mt-2 text-sm text-ink/60">
          {done.checkedIn ? 'Checked in. ' : ''}{done.emailed ? `Tickets emailed to ${done.email}.` : 'No email was given, so nothing was sent.'}
        </p>
        <div className="mt-10 space-y-3"><PrimaryButton onClick={again}>Sell another</PrimaryButton>
          <button type="button" onClick={() => nav(scanPath(`/events/${id}`), { replace: true })} className="w-full rounded-xl border border-ink/20 py-4 font-semibold">Back to attendee list</button></div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="mt-8">
      <h1 className="text-3xl font-bold">Sell tickets</h1>
      <p className="mt-1 text-sm text-ink/60">Collect payment first, then record the sale.</p>
      {loadError && <p role="alert" className="mt-8 rounded-xl bg-red-50 p-4 text-center text-red-700">{loadError}</p>}
      {!loadError && !opts && <p className="py-10 text-center text-ink/50">Loading…</p>}

      {opts && (
        <>
          <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
            {opts.tiers.map((t) => {
              const max = maxFor(t)
              return (
                <li key={t.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{t.name}{t.group_size ? <span className="ml-2 text-xs font-normal text-ink/60">Group of {t.group_size}</span> : null}</p>
                    <p className="text-sm font-medium text-brand">{formatPrice(t.price_minor / 100, opts.currency)}{t.remaining != null && <span className="ml-2 font-normal text-ink/50">{t.remaining} left</span>}</p>
                  </div>
                  {t.remaining === 0 ? <span className="text-sm text-ink/60">Sold out</span> : (
                    <select aria-label={`Quantity for ${t.name}`} value={qty[t.id] ?? 0} onChange={(e) => setQty((q) => ({ ...q, [t.id]: Number(e.target.value) }))} className="rounded-lg border border-ink/20 bg-white px-3 py-2">
                      {Array.from({ length: max + 1 }, (_, n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">First name<span className="text-red-600"> *</span><input value={f.first} onChange={set('first')} autoComplete="off" className={inputCls} /></label>
            <label className="block text-sm">Last name<span className="text-red-600"> *</span><input value={f.last} onChange={set('last')} autoComplete="off" className={inputCls} /></label>
            <label className="block text-sm">Email <span className="text-ink/50">(optional, to send the ticket)</span><input type="email" value={f.email} onChange={set('email')} autoComplete="off" className={inputCls} /></label>
            <label className="block text-sm">Phone <span className="text-ink/50">(optional)</span><input type="tel" value={f.phone} onChange={set('phone')} autoComplete="off" className={inputCls} /></label>
          </div>

          {total > 0 && (
            <fieldset className="mt-6">
              <legend className="text-sm font-medium">How did the guest pay?</legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {[['cash', 'Cash'], ['transfer', 'Bank transfer']].map(([v, label]) => (
                  <button key={v} type="button" aria-pressed={method === v} onClick={() => setMethod(v)}
                    className={`rounded-xl border py-3 font-medium ${method === v ? 'border-brand bg-brand/10 text-brand' : 'border-ink/20'}`}>{label}</button>
                ))}
              </div>
            </fieldset>
          )}

          {opts.can_check_in && (
            <label className="mt-6 flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" checked={checkIn} onChange={(e) => setCheckIn(e.target.checked)} className="h-5 w-5 accent-[#fa6540]" />Check the guest in now
            </label>
          )}

          {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div className="mt-6 flex items-center justify-between text-lg font-bold"><span>Total</span><span>{totalQty ? formatMoney(total / 100, opts.currency) : '—'}</span></div>
          <button type="submit" disabled={busy || !totalQty} className="mt-4 w-full rounded-xl bg-brand py-4 font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/40">{busy ? 'Recording sale…' : 'Sell tickets'}</button>
        </>
      )}
    </form>
  )
}

export default function ScanSell() {
  return <Guarded><Header back /><Body /></Guarded>
}
