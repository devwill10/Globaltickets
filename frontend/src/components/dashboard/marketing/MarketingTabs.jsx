import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, Mail, Users, Pencil, MoreVertical } from 'lucide-react'
import SegmentModal from './SegmentModal'
import ImportModal from './ImportModal'
import { listCampaigns, listSegments, deleteSegment, listSubscribers } from '../../../services/marketing'
import { AUTO_SEGMENTS, conditionText } from '../../../data/marketing'
import { useAuthStore } from '../../../store/authStore'
import { useToast } from '../../Toast'

const Empty = ({ icon, title, text, children }) => (
  <div className="rounded-2xl bg-gray-50 px-6 py-14 text-center">
    <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand/90 text-white">{icon}</span>
    <h2 className="mt-4 font-bold">{title}</h2>
    <p className="mx-auto mt-2 max-w-sm text-sm text-ink/70">{text}</p>
    {children}
  </div>
)
const btn = 'mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm text-white hover:bg-brand-dark'
const Search_ = ({ value, onChange, label }) => (
  <div className="relative max-w-sm">
    <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/50" />
    <input aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} className="w-full rounded-lg border border-ink/15 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-brand" />
  </div>
)
const Loading = () => <div className="h-28 animate-pulse rounded-xl bg-gray-100" aria-busy="true" />
const Failed = ({ text, retry }) => <div role="alert" className="rounded-xl border border-red-200 bg-red-50 py-10 text-center text-red-700">{text} <button className="ml-2 underline" onClick={retry}>Try again</button></div>
const when = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-')

export function CampaignsTab({ onNewEmail }) {
  const user = useAuthStore((s) => s.user)
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const load = useCallback(() => listCampaigns(user.id).then((d) => { setRows(d); setError('') }).catch((e) => setError(e.message)), [user.id])
  useEffect(() => { load() }, [load])
  const shown = useMemo(() => (rows ?? []).filter((r) => `${r.subject} ${r.audience_name ?? ''}`.toLowerCase().includes(q.trim().toLowerCase())), [rows, q])

  return (
    <div className="space-y-5">
      <Search_ value={q} onChange={setQ} label="Search campaign name or event" />
      {error ? <Failed text={error} retry={load} /> : rows === null ? <Loading />
      : rows.length === 0 ? (
        <Empty icon={<Mail size={30} />} title="You haven't created a campaign!" text="Create your first email campaign to reach out to your attendees or subscribers">
          <button type="button" onClick={onNewEmail} className={btn}><Plus size={16} />New email</button>
        </Empty>
      ) : shown.length === 0 ? <p className="py-10 text-center text-sm text-ink/60">No campaigns match your search.</p> : (
        <div className="overflow-x-auto rounded-xl border border-ink/10">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-gray-50 text-ink/70"><tr>{['Subject', 'Audience', 'Recipients', 'Status', 'Date'].map((h) => <th key={h} className="px-5 py-4 font-normal">{h}</th>)}</tr></thead>
            <tbody>{shown.map((r) => (
              <tr key={r.id} className="border-t border-ink/10"><td className="px-5 py-4 font-medium">{r.subject}</td><td className="px-5 py-4">{r.audience_name ?? r.audience}</td>
                <td className="px-5 py-4">{r.recipients}</td><td className="px-5 py-4 capitalize">{r.status}</td><td className="px-5 py-4">{when(r.sent_at ?? r.created_at)}</td></tr>))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function SegmentsTab({ overview, reloadOverview }) {
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const navigate = useNavigate()
  const [segments, setSegments] = useState(null)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // { segment? }
  const [menu, setMenu] = useState(null)
  const load = useCallback(() => listSegments(user.id).then((d) => { setSegments(d); setError('') }).catch((e) => setError(e.message)), [user.id])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menu])

  const send = (ref) => navigate(`/dashboard/marketing/new?audience=segment&ref=${encodeURIComponent(ref)}`)
  const count = (n) => `${n ?? 0} Subscriber${n === 1 ? '' : 's'}`
  async function remove(s) {
    if (!window.confirm(`Delete "${s.name}"?`)) return
    try { await deleteSegment(s.id); toast('Segment deleted'); load(); reloadOverview() } catch (e) { toast(e.message, 'error') }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Created for you</h2>
        <button type="button" onClick={() => setModal({})} className="inline-flex items-center gap-2 rounded-lg border border-ink/15 px-4 py-2.5 text-sm shadow-sm hover:border-brand"><Plus size={14} />New segment</button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {AUTO_SEGMENTS.map((s) => (
          <article key={s.key} className="flex flex-col rounded-xl bg-blush p-5">
            <p className="flex gap-2 text-[11px] text-brand"><span className="rounded bg-white px-2 py-0.5">Auto</span><span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5"><Users size={10} />{count(overview?.[s.key])}</span></p>
            <h3 className="mt-3 text-sm font-bold">{s.title}</h3>
            <p className="mt-2 flex-1 text-xs text-ink/70">{s.text}</p>
            <button type="button" onClick={() => send(s.key)} className="mt-4 rounded-lg bg-[#fdece8] py-3 text-sm text-brand hover:bg-[#fbdcd3]">Send email</button>
          </article>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-bold">Custom segments</h2>
      <p className="text-xs text-ink/70">Your custom built segments</p>
      <div className="mt-4">
        {error ? <Failed text={error} retry={load} /> : segments === null ? <Loading />
        : segments.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 px-6 py-16 text-center">
            <h3 className="font-bold">You have no segments yet</h3>
            <p className="mt-2 text-sm text-ink/70">Create segments and sift through the noise to find the right audience</p>
            <button type="button" onClick={() => setModal({})} className={btn}><Plus size={16} />Create a segment</button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-gray-50 text-ink/70"><tr><th className="px-5 py-4 font-normal">Segment name</th><th className="px-5 py-4 font-normal">Subscribers</th><th className="px-5 py-4 font-normal">Configuration</th><th className="px-5 py-4"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>{segments.map((s) => (
                <tr key={s.id} className="border-t border-ink/10">
                  <td className="px-5 py-4">{s.name}</td><td className="px-5 py-4">{overview?.custom?.[s.id] ?? 0}</td>
                  <td className="px-5 py-4"><span className="flex flex-wrap gap-1.5">{s.conditions.map((c, i) => <span key={i} className="rounded bg-gray-100 px-2 py-0.5 text-[11px]">{conditionText(c)}</span>)}{s.conditions.length > 1 && <span className="text-[11px] text-ink/50">({s.match === 'all' ? 'all' : 'any'} match)</span>}</span></td>
                  <td className="relative px-5 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button aria-label={`Edit ${s.name}`} onClick={() => setModal({ segment: s })} className="text-ink/70 hover:text-brand"><Pencil size={16} /></button>
                      <button aria-label={`More actions for ${s.name}`} aria-expanded={menu === s.id} onClick={(e) => { e.stopPropagation(); setMenu(menu === s.id ? null : s.id) }} className="text-brand"><MoreVertical size={16} /></button>
                    </div>
                    {menu === s.id && (
                      <div className="absolute right-5 top-12 z-10 w-40 rounded-lg border border-ink/10 bg-white py-1 text-sm shadow-lg">
                        <button className="block w-full px-4 py-2 text-left hover:bg-blush" onClick={() => send(s.id)}>Send email</button>
                        <button className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50" onClick={() => remove(s)}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>))}</tbody>
            </table>
          </div>
        )}
      </div>

      {modal && <SegmentModal segment={modal.segment} onClose={() => setModal(null)}
        onSaved={(_, isNew) => { toast(isNew ? 'Segment created' : 'Segment updated'); setModal(null); load(); reloadOverview() }} />}
    </div>
  )
}

export function SubscribersTab({ reloadOverview }) {
  const toast = useToast()
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [importing, setImporting] = useState(false)
  const load = useCallback(() => listSubscribers().then((d) => { setRows(d); setError('') }).catch((e) => setError(e.message)), [])
  useEffect(() => { load() }, [load])
  const shown = useMemo(() => (rows ?? []).filter((r) => `${r.email} ${r.name ?? ''}`.toLowerCase().includes(q.trim().toLowerCase())), [rows, q])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Search_ value={q} onChange={setQ} label="Search subscribers" />
        <button type="button" onClick={() => setImporting(true)} className="rounded-lg border border-ink/15 px-5 py-3 text-sm hover:border-brand">Import subscribers</button>
      </div>
      {error ? <Failed text={error} retry={load} /> : rows === null ? <Loading />
      : rows.length === 0 ? (
        <Empty icon={<Users size={30} />} title="You have no subscribers yet" text="Create an event and let your community find you">
          <Link to="/dashboard/events/new" className={btn}><Plus size={16} />Create an event</Link>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-gray-50 text-ink/70"><tr>{['Email', 'Name', 'Events', 'Tickets', 'Last purchase', 'Source'].map((h) => <th key={h} className="px-5 py-4 font-normal">{h}</th>)}</tr></thead>
            <tbody>{shown.slice(0, 200).map((r) => (
              <tr key={r.email} className="border-t border-ink/10"><td className="px-5 py-3.5">{r.email}</td><td className="px-5 py-3.5">{r.name || '-'}</td><td className="px-5 py-3.5">{r.events_count}</td>
                <td className="px-5 py-3.5">{r.tickets_count}</td><td className="px-5 py-3.5">{when(r.last_purchase_at)}</td><td className="px-5 py-3.5">{r.source === 'purchase' ? 'Ticket buyer' : 'Imported'}</td></tr>))}</tbody>
          </table>
          {shown.length > 200 && <p className="border-t border-ink/10 px-5 py-3 text-xs text-ink/60">Showing the first 200 of {shown.length}. Use search to narrow it down.</p>}
        </div>
      )}
      <p className="text-xs text-ink/60">Ticket buyers appear here only if they ticked "Keep me updated" at checkout.</p>
      {importing && <ImportModal onClose={() => setImporting(false)}
        onDone={(added, found) => { toast(`${added} new subscriber${added === 1 ? '' : 's'} added${found > added ? ` (${found - added} already on your list)` : ''}`); setImporting(false); load(); reloadOverview() }} />}
    </div>
  )
}
