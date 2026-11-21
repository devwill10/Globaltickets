import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store, Plus, SlidersHorizontal } from 'lucide-react'
import { listBoxOffices } from '../../services/boxOffice'
import { useAuthStore } from '../../store/authStore'
import { inputCls } from '../../components/dashboard/FormBits'

const TABS = [['all', 'All box office'], ['published', 'Published'], ['draft', 'Drafts']]

export default function BoxOffices() {
  const user = useAuthStore((s) => s.user)
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let off = false
    listBoxOffices(user.id).then((d) => !off && setRows(d)).catch((e) => !off && setError(e.message))
    return () => { off = true }
  }, [user.id, attempt])

  const shown = useMemo(() => (rows ?? []).filter((b) => (tab === 'all' || b.status === tab) && b.title.toLowerCase().includes(q.trim().toLowerCase())), [rows, tab, q])

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Box Office</h1>
        <Link to="/dashboard/box-office/new" className="rounded-lg bg-brand px-6 py-3 text-sm text-white hover:bg-brand-dark">Create box office</Link>
      </div>

      <div className="relative mt-8 flex items-center justify-between border-b border-ink/10">
        <div role="tablist" className="flex gap-8">
          {TABS.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`-mb-px border-b-2 pb-4 text-sm ${tab === k ? 'border-brand font-medium text-brand' : 'border-transparent'}`}>{label}</button>
          ))}
        </div>
        <button onClick={() => setShowFilter(!showFilter)} aria-expanded={showFilter} className="mb-3 flex items-center gap-2 text-sm text-brand"><SlidersHorizontal size={15} />Filter ({q.trim() ? 1 : 0})</button>
        {showFilter && <div className="absolute right-0 top-full z-10 mt-2 w-64 rounded-lg border border-ink/10 bg-white p-4 shadow-lg"><input aria-label="Search by name" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name" className={inputCls(false)} /></div>}
      </div>

      <div className="mt-6">
        {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 py-12 text-center text-red-700">{error} <button className="ml-2 underline" onClick={() => { setError(''); setAttempt((a) => a + 1) }}>Try again</button></div>
        : rows === null ? <div className="h-64 w-80 animate-pulse rounded-xl bg-gray-100" aria-busy="true" />
        : rows.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 px-6 py-14 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-orange-100 text-brand"><Store size={30} /></span>
            <h2 className="mt-4 font-bold">Create your first box office</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink/70">A box office is a branded page that collects your events in one place, so you can share a single link.</p>
            <Link to="/dashboard/box-office/new" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm text-white hover:bg-brand-dark"><Plus size={16} />Create box office</Link>
          </div>
        ) : shown.length === 0 ? <p className="rounded-xl bg-gray-50 py-14 text-center text-sm text-ink/60">No box offices here yet.</p> : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((b) => (
              <li key={b.id}>
                <Link to={`/dashboard/box-office/${b.id}`} className="block rounded-xl border border-ink/10 bg-white p-4 shadow-sm hover:shadow-md">
                  {b.image_url ? <img src={b.image_url} alt="" className="aspect-[2/1] w-full rounded-lg object-cover" /> : <div className="aspect-[2/1] w-full rounded-lg bg-gradient-to-br from-orange-200 to-orange-400" />}
                  <p className="mt-4 flex items-center justify-between gap-2 text-sm font-medium"><span className="truncate">{b.title}</span>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs capitalize ${b.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{b.status}</span></p>
                  <p className="mt-1 text-xs text-ink/60">{b.events} event{b.events === 1 ? '' : 's'}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
