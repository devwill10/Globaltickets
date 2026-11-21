import { useEffect, useMemo, useState } from 'react'
import { Coins, Info, Search, SlidersHorizontal } from 'lucide-react'
import Modal from '../../Modal'
import { Label, ErrorText, inputCls } from '../FormBits'
import { getMyProfile, saveProfile, saveNotifications, getCreditSummary, listCreditLedger } from '../../../services/account'
import { useAuthStore } from '../../../store/authStore'
import { useToast } from '../../Toast'

const PHONE = /^\+[0-9]{8,15}$/
const saveBtn = 'mt-10 block w-full max-w-xs rounded-lg bg-brand py-4 text-sm text-white hover:bg-brand-dark disabled:opacity-60'
const Loading = () => <div className="h-40 animate-pulse rounded-xl bg-gray-100" aria-busy="true" />

export function ProfileTab() {
  const user = useAuthStore((s) => s.user)
  const refresh = useAuthStore((s) => s.refreshProfile)
  const toast = useToast()
  const [v, setV] = useState(null)
  const [org, setOrg] = useState(false)
  const [errors, setErrors] = useState({})
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let off = false
    getMyProfile(user.id).then((p) => {
      if (off) return
      setOrg(p?.account_type === 'organisation')
      setV({ firstName: p?.first_name ?? '', middleName: p?.middle_name ?? '', lastName: p?.last_name ?? '', phone: p?.phone ?? '', businessName: p?.business_name ?? '' })
    }).catch((e) => !off && setLoadError(e.message))
    return () => { off = true }
  }, [user.id])

  const set = (k) => (e) => { setV((x) => ({ ...x, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: undefined })) }
  const bad = (k) => ({ id: `p-${k}`, 'aria-invalid': Boolean(errors[k]), 'aria-describedby': errors[k] ? `pe-${k}` : undefined })

  async function submit(ev) {
    ev.preventDefault()
    const e = {}
    if (!v.firstName.trim()) e.firstName = 'First name is required'
    if (!v.lastName.trim()) e.lastName = 'Last name is required'
    if (!PHONE.test(v.phone.replace(/[\s()-]/g, ''))) e.phone = 'Enter your phone number with country code, for example +2348012345678'
    if (org && v.businessName.trim().length < 2) e.businessName = 'Business name is required'
    setErrors(e)
    const key = Object.keys(e)[0]
    if (key) { document.getElementById(`p-${key}`)?.focus(); return }
    setSaving(true)
    try { await saveProfile(user.id, v); await refresh(); toast('Profile saved') } catch (x) { toast(x.message, 'error') } finally { setSaving(false) }
  }

  if (loadError) return <p role="alert" className="rounded-xl bg-red-50 py-10 text-center text-red-700">{loadError}</p>
  if (!v) return <Loading />
  const field = (k, label, props = {}) => (
    <div>
      <Label htmlFor={`p-${k}`} required={props.required}>{label}</Label>
      <input {...bad(k)} value={v[k]} onChange={set(k)} placeholder={props.placeholder ?? label} maxLength={props.max ?? 100} autoComplete={props.ac} className={inputCls(errors[k])} />
      <ErrorText id={`pe-${k}`}>{errors[k]}</ErrorText>
    </div>
  )
  return (
    <form onSubmit={submit} noValidate>
      <h2 className="text-xl font-bold">Personal details</h2>
      <div className="mt-8 grid gap-x-8 gap-y-6 md:grid-cols-2">
        {field('firstName', 'First name', { required: true, ac: 'given-name' })}
        {field('lastName', 'Last name', { required: true, ac: 'family-name' })}
        {field('middleName', 'Middle name', { ac: 'additional-name' })}
        {field('phone', 'Phone number', { required: true, placeholder: 'Phone number (e.g., +2348012345678)', max: 20, ac: 'tel' })}
        {org && field('businessName', 'Registered business name', { required: true, max: 150, ac: 'organization' })}
        <div className={org ? '' : 'md:col-span-1'}>
          <Label htmlFor="p-email" required>Primary email address</Label>
          <input id="p-email" value={user.email} disabled className={inputCls(false)} />
          <p className="mt-3 flex items-center gap-2 text-sm text-ink/70"><Info size={15} className="text-brand" /><span><a href="mailto:support@ticketsglobal.com" className="text-brand hover:underline">Contact us</a> to update your email address</span></p>
        </div>
      </div>
      <button type="submit" disabled={saving} className={`${saveBtn} mx-auto`}>{saving ? 'Saving…' : 'Save'}</button>
    </form>
  )
}

const FREQ = [['daily', 'Daily: A summary of all orders from the day.'], ['weekly', 'Weekly: A summary of all orders from the week.'], ['never', 'Never: Turn off these notifications']]
export function SettingsTab() {
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const [value, setValue] = useState(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => { let off = false; getMyProfile(user.id).then((p) => !off && setValue(p?.order_notifications ?? 'daily')).catch((e) => !off && toast(e.message, 'error')); return () => { off = true } }, [user.id]) // eslint-disable-line react-hooks/exhaustive-deps
  async function save() { setSaving(true); try { await saveNotifications(user.id, value); toast('Settings saved') } catch (e) { toast(e.message, 'error') } finally { setSaving(false) } }
  if (value === null) return <Loading />
  return (
    <div>
      <h2 className="text-xl font-bold">Email order notifications</h2>
      <p className="mt-2 text-sm text-ink/70">Choose how often you want to receive order updates.</p>
      <div role="radiogroup" aria-label="Email order notifications" className="mt-6 space-y-4">
        {FREQ.map(([k, label]) => (
          <label key={k} className="flex cursor-pointer items-center gap-3 text-sm">
            <input type="radio" name="freq" checked={value === k} onChange={() => setValue(k)} className="peer sr-only" />
            <span aria-hidden="true" className={`h-5 w-5 shrink-0 rounded-full border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 ${value === k ? 'border-brand bg-brand shadow-[inset_0_0_0_3px_white]' : 'border-ink/25'}`} />{label}
          </label>
        ))}
      </div>
      <p className="mt-6 text-xs text-ink/60">Your choice is saved now. Summary emails start once email sending is switched on.</p>
      <button type="button" onClick={save} disabled={saving} className={`${saveBtn} mx-auto`}>{saving ? 'Saving…' : 'Save'}</button>
    </div>
  )
}

const when = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
export function CreditTab() {
  const user = useAuthStore((s) => s.user)
  const [sum, setSum] = useState(null)
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('all')
  const [showFilter, setShowFilter] = useState(false)
  const [topUp, setTopUp] = useState(false)
  useEffect(() => {
    let off = false
    Promise.all([getCreditSummary(), listCreditLedger(user.id)]).then(([s, r]) => { if (!off) { setSum(s); setRows(r) } }).catch((e) => !off && setError(e.message))
    return () => { off = true }
  }, [user.id])
  const shown = useMemo(() => (rows ?? []).filter((r) => (kind === 'all' || (kind === 'used' ? r.delta < 0 : r.kind === kind)) && r.reason.toLowerCase().includes(q.trim().toLowerCase())), [rows, q, kind])
  const coin = <Coins size={18} className="text-brand" aria-label="credits" />
  if (error) return <p role="alert" className="rounded-xl bg-red-50 py-10 text-center text-red-700">{error}</p>
  if (!sum) return <Loading />
  return (
    <div>
      <h2 className="text-xl font-bold">Credit</h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="flex items-end justify-between rounded-xl border border-brand/20 bg-blush p-6">
          <div><h3 className="font-bold">Total credit balance</h3><p className="mt-1 max-w-xs text-xs text-ink/70">Your total balance of purchased and promotional credits</p>
            <button type="button" onClick={() => setTopUp(true)} className="mt-6 rounded-lg bg-brand px-6 py-3 text-sm text-white hover:bg-brand-dark">Top up</button></div>
          <p className="text-right"><span className="flex items-center justify-end gap-2 text-4xl font-bold">{coin}{sum.purchased + sum.bonus}</span><span className="text-xs text-ink/60">Total credit</span></p>
        </div>
        <div className="divide-y divide-brand/20 rounded-xl border border-brand/20 bg-blush px-6">
          {[['Purchased credit', sum.purchased, 'Credits you bought.'], ['Bonus credit', sum.bonus, 'Free credits given to you.']].map(([l, n, tip]) => (
            <div key={l} className="flex items-center justify-between py-5 text-sm"><span className="flex items-center gap-1.5">{l}<Info size={13} className="text-ink/50" aria-label={tip} /></span>
              <span className="text-right"><span className="flex items-center justify-end gap-1.5 text-xl font-bold">{coin}{n}</span><span className="text-xs text-ink/60">Balance</span></span></div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-ink/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="font-bold">Credit usage</h3><p className="text-xs text-ink/70">Breakdown of credit usage</p></div>
          <div className="relative flex items-center gap-3">
            <button type="button" onClick={() => setShowFilter(!showFilter)} aria-expanded={showFilter} className="flex items-center gap-2 rounded-lg border border-ink/15 px-4 py-2.5 text-sm"><SlidersHorizontal size={14} />Filter</button>
            {showFilter && <select aria-label="Filter by type" value={kind} onChange={(e) => setKind(e.target.value)} className="absolute right-0 top-full z-10 mt-2 w-44 rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm shadow-lg" size={4}>
              <option value="all">All</option><option value="purchased">Purchased</option><option value="bonus">Bonus</option><option value="used">Used</option></select>}
            <div className="relative"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/50" /><input aria-label="Search by description" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by description" className="w-56 rounded-lg border border-ink/15 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand" /></div>
          </div>
        </div>
        {shown.length === 0 ? <p className="py-14 text-center text-sm text-ink/60">No transactions yet.</p> : (
          <ul className="mt-4 divide-y divide-ink/10 text-sm">{shown.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-4 py-3"><span><span className="block">{r.reason}</span><span className="text-xs text-ink/60">{when(r.created_at)} · {r.kind}</span></span>
              <span className={`font-bold ${r.delta < 0 ? 'text-red-600' : 'text-green-700'}`}>{r.delta > 0 ? '+' : ''}{r.delta}</span></li>))}</ul>
        )}
      </div>

      {topUp && (
        <Modal title="Top up credit" align="left" width="max-w-md" onClose={() => setTopUp(false)}
          footer={<button type="button" onClick={() => setTopUp(false)} className="w-full rounded-lg bg-brand py-3 text-sm text-white hover:bg-brand-dark">OK</button>}>
          <p className="text-sm text-ink/80">Topping up isn't available yet. It needs online payments, which are coming soon.</p>
        </Modal>
      )}
    </div>
  )
}
