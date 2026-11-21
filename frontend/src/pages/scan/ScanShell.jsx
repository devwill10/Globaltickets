import { Navigate, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, ChevronLeft, ChevronRight } from 'lucide-react'
import { ToastProvider } from '../../components/Toast'
import { getStaff, scanPath } from '../../services/scan'

// Wraps every scan screen: toast support + "must be signed in" guard
export function Guarded({ children }) {
  if (!getStaff()) return <Navigate to={scanPath('/')} replace />
  return <ToastProvider><div className="mx-auto min-h-dvh w-full max-w-3xl px-5 pb-8 pt-6">{children}</div></ToastProvider>
}

export function Header({ title, back, right }) {
  const nav = useNavigate()
  return (
    <header className="flex items-center justify-between gap-3">
      {back ? <button type="button" aria-label="Go back" onClick={() => nav(-1)} className="-ml-1 p-1"><ArrowLeft size={22} /></button> : <h1 className="text-3xl font-bold">{title}</h1>}
      {right ?? <Link to={scanPath('/events')} aria-label="Events" className="p-1"><Home size={24} /></Link>}
    </header>
  )
}

export const PrimaryButton = ({ className = '', ...p }) => (
  <button type="button" {...p} className={`w-full rounded-xl bg-brand py-4 text-base font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/40 ${className}`} />
)

export function Pager({ page, pages, onPage }) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-lg bg-ink/[0.04] text-sm">
      <label className="flex flex-1 items-center gap-2 px-4 py-3">
        <select value={page} onChange={(e) => onPage(Number(e.target.value))} aria-label="Page" className="bg-transparent font-medium outline-none">
          {Array.from({ length: pages }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
        </select>
        <span className="text-ink/70">of {pages} {pages === 1 ? 'page' : 'pages'}</span>
      </label>
      <div className="flex flex-1 items-center justify-end gap-6 border-l border-ink/10 px-5">
        <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} className="disabled:opacity-30"><ChevronLeft size={18} /></button>
        <button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)} className="disabled:opacity-30"><ChevronRight size={18} /></button>
      </div>
    </div>
  )
}
