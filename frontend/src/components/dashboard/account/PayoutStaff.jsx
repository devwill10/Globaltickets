import { useCallback, useEffect, useState } from 'react'
import { Landmark, Plus, Pencil, ClipboardCheck, UserX, UserCheck, Copy, User, BadgeCheck } from 'lucide-react'
import Modal from '../../Modal'
import { Label, ErrorText, SelectBox, inputCls } from '../FormBits'
import { getPayoutAccount, listBanks, resolveAccount, savePayoutAccount } from '../../../services/payouts'
import { listStaff, addStaff, updateStaff, getStaffEventIds, saveStaffEvents } from '../../../services/account'
import { listEmailableEvents } from '../../../services/marketing'
import { useAuthStore } from '../../../store/authStore'
import { useToast } from '../../Toast'
import { formatEventDate } from '../../../utils/format'

const Loading = () => <div className="h-40 animate-pulse rounded-xl bg-gray-100" aria-busy="true" />
const cancelBtn = 'rounded-lg bg-[#fdece8] py-3.5 text-sm text-brand hover:bg-[#fbdcd3]'
const primaryBtn = 'rounded-lg bg-brand py-3.5 text-sm text-white hover:bg-brand-dark disabled:opacity-60'

function PayoutModal({ onClose, onSaved }) {
  const [banks, setBanks] = useState(null)
  const [bankErr, setBankErr] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [number, setNumber] = useState('')
  const [name, setName] = useState('')
  const [nameErr, setNameErr] = useState('')
  const [resolving, setResolving] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { let off = false; listBanks().then((b) => !off && setBanks(b)).catch((e) => !off && setBankErr(e.message)); return () => { off = true } }, [])
  useEffect(() => {
    setName(''); setNameErr('')
    if (!bankCode || !/^\d{10}$/.test(number)) return
    let off = false
    setResolving(true)
    const t = setTimeout(() => resolveAccount(bankCode, number).then((n) => !off && setName(n)).catch((e) => !off && setNameErr(e.message)).finally(() => !off && setResolving(false)), 400)
    return () => { off = true; clearTimeout(t); setResolving(false) }
  }, [bankCode, number])

  async function save() {
    setSaving(true); setError('')
    try { await savePayoutAccount(bankCode, number); onSaved() } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  return (
    <Modal title="Add payout account" onClose={onClose}
      footer={<div className="grid grid-cols-2 gap-4"><button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
        <button type="button" onClick={save} disabled={!name || saving} className={primaryBtn}>{saving ? 'Saving…' : 'Save'}</button></div>}>
      <p className="rounded-lg bg-blush px-4 py-4 text-sm">You can edit this information later.</p>
      {bankErr && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{bankErr}</p>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="mt-5 space-y-5">
        <div><Label htmlFor="po-method" required>Payment Method</Label><SelectBox id="po-method" value="bank" onChange={() => {}} options={[{ value: 'bank', label: 'Bank Transfer' }]} placeholder="" disabled /></div>
        <div><Label htmlFor="po-currency" required>Currency</Label><SelectBox id="po-currency" value="NGN" onChange={() => {}} options={['NGN']} placeholder="" /></div>
        <p className="text-sm">Account information</p>
        <div><Label htmlFor="po-bank" required>Bank name</Label>
          <SelectBox id="po-bank" value={bankCode} onChange={setBankCode} placeholder={banks === null && !bankErr ? 'Loading banks…' : 'Select Bank'} disabled={!banks} options={(banks ?? []).map((b) => ({ value: b.code, label: b.name }))} /></div>
        <div><Label htmlFor="po-number" required>Account number</Label>
          <input id="po-number" value={number} onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" placeholder="Account number" autoComplete="off" className={inputCls(nameErr)} />
          <ErrorText>{nameErr}</ErrorText></div>
        <div><Label htmlFor="po-name" required>Account name</Label>
          <input id="po-name" value={resolving ? 'Checking…' : name} readOnly disabled className={inputCls(false)} />
          <p className="mt-1 text-xs text-ink/60">Filled in automatically from your bank. It must match the name on your profile.</p></div>
      </div>
    </Modal>
  )
}

export function PayoutsTab() {
  const toast = useToast()
  const [acct, setAcct] = useState(undefined) // undefined = loading, null = none
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const load = useCallback(() => getPayoutAccount().then((a) => { setAcct(a); setError('') }).catch((e) => setError(e.message)), [])
  useEffect(() => { load() }, [load])
  if (error) return <p role="alert" className="rounded-xl bg-red-50 py-10 text-center text-red-700">{error} <button className="ml-2 underline" onClick={load}>Try again</button></p>
  if (acct === undefined) return <Loading />
  return (
    <div>
      <h2 className="text-xl font-bold">Payout account</h2>
      {acct ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink/10 p-6">
          <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-xl bg-blush text-brand"><Landmark size={22} /></span>
            <div><p className="font-bold">{acct.bank_name}</p><p className="text-sm text-ink/70">{acct.account_name} · •••• {acct.account_last4} · {acct.currency}</p></div></div>
          <div className="flex items-center gap-3"><span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs text-green-800"><BadgeCheck size={13} />Verified</span>
            <button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-ink/20 px-5 py-2.5 text-sm hover:border-brand">Edit</button></div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-gray-50 px-6 py-16 text-center">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-orange-100 text-brand"><Landmark size={40} /></span>
          <h3 className="mt-5 text-lg font-bold">Get paid when you make sales.</h3>
          <p className="mt-2 text-sm text-ink/70">Add your bank account details to receive payouts from ticket sales.</p>
          <button type="button" onClick={() => setOpen(true)} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand px-8 py-4 text-sm text-white hover:bg-brand-dark"><Plus size={16} />Add payout account</button>
        </div>
      )}
      {open && <PayoutModal onClose={() => setOpen(false)} onSaved={() => { setOpen(false); toast('Payout account saved'); load() }} />}
    </div>
  )
}

function Switch({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-brand' : 'bg-gray-200'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}

function StaffModal({ staff, onClose, onSaved }) {
  const [name, setName] = useState(staff?.name ?? '')
  const [check, setCheck] = useState(staff?.can_check_in ?? true)
  const [sell, setSell] = useState(staff?.can_sell ?? false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function submit(e) {
    e.preventDefault()
    if (name.trim().length < 2) return setError('Enter a name of at least 2 characters.')
    setSaving(true); setError('')
    try {
      if (staff) await updateStaff(staff.id, { name: name.trim(), can_check_in: check, can_sell: sell })
      else { const row = await addStaff(name.trim(), check); if (sell) await updateStaff(row.id, { can_sell: true }) }
      onSaved(!staff)
    }
    catch (x) { setError(/2 to 60|up to 50/.test(x.message) ? x.message : 'Could not save. Please try again.') } finally { setSaving(false) }
  }
  return (
    <Modal title={staff ? 'Edit team member' : 'Add team member'} align="left" onClose={onClose}
      footer={<div className="grid grid-cols-2 gap-4"><button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
        <button type="submit" form="staff-form" disabled={saving} className={primaryBtn}>{saving ? 'Saving…' : staff ? 'Save' : 'Add team member'}</button></div>}>
      <form id="staff-form" onSubmit={submit} noValidate className="space-y-6">
        {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div><Label htmlFor="st-name" required>Name</Label><input id="st-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={inputCls(false)} /></div>
        <div><p className="text-sm font-bold">Permissions</p>
          <div className="mt-4 flex items-center justify-between text-sm"><span>Check in tickets</span><Switch checked={check} onChange={setCheck} label="Check in tickets" /></div>
          <div className="mt-4 flex items-center justify-between gap-4 text-sm"><span>Sell tickets at the door<span className="block text-xs text-ink/60">They collect cash or transfers themselves and record the sale.</span></span><Switch checked={sell} onChange={setSell} label="Sell tickets at the door" /></div></div>
      </form>
    </Modal>
  )
}

function AssignModal({ staff, userId, onClose, onSaved }) {
  const [events, setEvents] = useState(null)
  const [all, setAll] = useState(staff.all_events)
  const [picked, setPicked] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    let off = false
    Promise.all([listEmailableEvents(userId), getStaffEventIds(staff.id)]).then(([evs, ids]) => { if (!off) { setEvents(evs); setPicked(ids) } }).catch((e) => !off && setError(e.message))
    return () => { off = true }
  }, [userId, staff.id])
  async function save() { setSaving(true); setError(''); try { await saveStaffEvents(staff.id, all, picked); onSaved() } catch (e) { setError(e.message) } finally { setSaving(false) } }
  return (
    <Modal title={`Events for ${staff.name}`} align="left" width="max-w-md" onClose={onClose}
      footer={<div className="grid grid-cols-2 gap-4"><button type="button" onClick={onClose} className={cancelBtn}>Cancel</button><button type="button" onClick={save} disabled={saving || events === null} className={primaryBtn}>{saving ? 'Saving…' : 'Save'}</button></div>}>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="flex items-center justify-between gap-3 text-sm"><span>Can check in guests at all my events</span><Switch checked={all} onChange={setAll} label="All events" /></div>
      <p className="mt-6 text-sm font-bold">or choose specific events</p>
      <div className="mt-3">
        {events === null ? <p className="text-xs text-ink/60" role="status">Loading…</p> : events.length === 0 ? <p className="text-xs">You have no published upcoming events.</p> : (
          <ul className={`space-y-2 ${all ? 'opacity-50' : ''}`}>{events.map((e) => (
            <li key={e.id}><label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink/10 p-3 text-sm">
              <input type="checkbox" disabled={all} checked={picked.includes(e.id)} onChange={() => setPicked((p) => (p.includes(e.id) ? p.filter((x) => x !== e.id) : [...p, e.id]))} className="mt-1 h-4 w-4 accent-[#fa6540]" />
              <span><span className="block font-medium">{e.title}</span><span className="text-xs text-ink/60">{formatEventDate(e.starts_at)}</span></span></label></li>))}</ul>
        )}
      </div>
    </Modal>
  )
}

export function StaffTab() {
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // { type: 'form' | 'assign', staff? }
  const load = useCallback(() => listStaff(user.id).then((d) => { setRows(d); setError('') }).catch((e) => setError(e.message)), [user.id])
  useEffect(() => { load() }, [load])

  async function copy(code) { try { await navigator.clipboard.writeText(code); toast('Passcode copied') } catch { toast('Could not copy. Select the code and copy it.', 'error') } }
  async function toggle(s) {
    if (s.is_active && !window.confirm(`Deactivate ${s.name}? They will no longer be able to sign in.`)) return
    try { await updateStaff(s.id, { is_active: !s.is_active }); toast(s.is_active ? 'Team member deactivated' : 'Team member activated'); load() } catch (e) { toast(e.message, 'error') }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="text-xl font-bold">Staff <span className="text-sm font-normal text-ink/50">({rows?.length ?? 0})</span></h2>
          <p className="mt-2 text-sm text-ink/70">Team members can check in attendees at events.</p></div>
        <button type="button" onClick={() => setModal({ type: 'form' })} className="rounded-lg bg-brand px-6 py-3 text-sm text-white hover:bg-brand-dark">Add staff</button>
      </div>
      <div className="mt-6">
        {error ? <p role="alert" className="rounded-xl bg-red-50 py-10 text-center text-red-700">{error} <button className="ml-2 underline" onClick={load}>Try again</button></p>
        : rows === null ? <Loading />
        : rows.length === 0 ? <p className="rounded-xl bg-gray-50 py-14 text-center text-sm text-ink/60">No team members yet. Add someone to help check in guests.</p> : (
          <div className="overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-gray-50 text-ink/70"><tr><th className="px-5 py-4 font-normal">Staff</th><th className="px-5 py-4 font-normal">Passcode</th><th className="px-5 py-4 font-normal">Status</th><th className="px-5 py-4"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>{rows.map((s) => (
                <tr key={s.id} className="border-t border-ink/10">
                  <td className="px-5 py-4"><span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-blush text-brand"><User size={16} /></span>{s.name}</span></td>
                  <td className="px-5 py-4"><span className="inline-flex items-center gap-2 font-mono">{s.passcode}<button type="button" aria-label={`Copy passcode for ${s.name}`} onClick={() => copy(s.passcode)} className="text-ink/50 hover:text-brand"><Copy size={14} /></button></span></td>
                  <td className="px-5 py-4"><span className={`rounded px-3 py-1 text-xs ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-ink/70'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-5 py-4"><div className="flex items-center justify-end gap-4 text-ink/70">
                    <button aria-label={`Edit ${s.name}`} onClick={() => setModal({ type: 'form', staff: s })} className="hover:text-brand"><Pencil size={17} /></button>
                    <button aria-label={`Choose events for ${s.name}`} onClick={() => setModal({ type: 'assign', staff: s })} className="hover:text-brand"><ClipboardCheck size={17} /></button>
                    <button aria-label={s.is_active ? `Deactivate ${s.name}` : `Activate ${s.name}`} onClick={() => toggle(s)} className="hover:text-brand">{s.is_active ? <UserX size={17} /> : <UserCheck size={17} />}</button></div></td>
                </tr>))}</tbody>
            </table>
          </div>
        )}
      </div>
      {modal?.type === 'form' && <StaffModal staff={modal.staff} onClose={() => setModal(null)} onSaved={(isNew) => { toast(isNew ? 'Team member added' : 'Team member updated'); setModal(null); load() }} />}
      {modal?.type === 'assign' && <AssignModal staff={modal.staff} userId={user.id} onClose={() => setModal(null)} onSaved={() => { toast('Events saved'); setModal(null); load() }} />}
    </div>
  )
}
