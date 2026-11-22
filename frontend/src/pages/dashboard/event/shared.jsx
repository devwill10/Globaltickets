import { useCallback, useEffect, useState } from 'react'

const LOCALES = { NGN: 'en-NG', GHS: 'en-GH', KES: 'en-KE', ZAR: 'en-ZA' }
export const money = (minor, currency = 'NGN') =>
  new Intl.NumberFormat(LOCALES[currency] ?? 'en', { style: 'currency', currency, minimumFractionDigits: 2 }).format((minor ?? 0) / 100)

// Loads something once (and again on reload()), keeping loading and error state
export function useLoad(fn, deps) {
  const [state, setState] = useState({ data: null, error: '', loading: true })
  const [n, setN] = useState(0)
  useEffect(() => {
    let off = false
    setState((s) => ({ ...s, loading: true, error: '' }))
    fn().then((data) => !off && setState({ data, error: '', loading: false }))
      .catch((e) => !off && setState({ data: null, error: e.message, loading: false }))
    return () => { off = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, n])
  return { ...state, reload: useCallback(() => setN((x) => x + 1), []) }
}

export const StatCard = ({ value, label }) => (
  <div className="rounded-lg border border-ink/10 bg-white px-6 py-5 shadow-sm">
    <p className="text-3xl font-bold text-brand">{value}</p>
    <p className="mt-6 text-sm font-bold">{label}</p>
  </div>
)

export const Skeleton = () => (
  <div aria-busy="true" className="mt-8 space-y-4">
    <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100" />)}</div>
    <div className="h-48 animate-pulse rounded-lg bg-gray-100" />
  </div>
)

export const ErrorBox = ({ message, onRetry }) => (
  <div role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 py-10 text-center text-red-700">
    {message}{onRetry && <button type="button" onClick={onRetry} className="ml-2 underline">Try again</button>}
  </div>
)

export const Th = ({ children, className = '' }) => <th scope="col" className={`px-3 py-4 text-left text-sm font-bold text-ink/70 ${className}`}>{children}</th>
