import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { verifySignInLink } from '../services/auth'
import { useAuthStore } from '../store/authStore'

const TYPES = ['email', 'magiclink', 'signup']

// Only allow paths on our own site (accepts "/path" or a same-site full address).
function safeNext(raw) {
  if (!raw) return '/dashboard'
  try {
    const u = new URL(raw, window.location.origin)
    return u.origin === window.location.origin ? u.pathname + u.search + u.hash : '/dashboard'
  } catch { return '/dashboard' }
}

// The email's Sign in button lands here. We verify the one-time code, then send the person onward.
export default function ConfirmSignIn() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const ran = useRef(false) // the code works once, so never run twice (React dev mode runs effects twice)
  const user = useAuthStore((s) => s.user)
  const [error, setError] = useState('')

  // Already signed in (for example the link was opened a second time): just carry on, no error.
  useEffect(() => { if (user) navigate(safeNext(params.get('next')), { replace: true }) }, [user, params, navigate])

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const tokenHash = params.get('token_hash')
    const type = params.get('type')
    if (!tokenHash || !TYPES.includes(type)) { setError('This sign-in link has already been used or has expired.'); return }
    verifySignInLink(tokenHash, type)
      .then(() => navigate(safeNext(params.get('next')), { replace: true }))
      .catch((e) => setError(e.message))
  }, [params, navigate])

  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-5"><Link to="/" className="text-2xl font-medium tracking-tight text-brand">ticketsglobal</Link></header>
      <main className="grid min-h-[70vh] place-items-center px-6 text-center">
        {error ? (
          <div role="alert" className="max-w-sm">
            <AlertCircle size={40} className="mx-auto text-red-500" />
            <h1 className="mt-4 text-2xl font-bold">Link problem</h1>
            <p className="mt-3 text-sm text-ink/80">{error}</p>
            <Link to="/tickets/sign-in" className="mt-6 inline-block rounded-md bg-brand px-6 py-3 text-sm text-white hover:bg-brand-dark">Send a new link</Link>
          </div>
        ) : <p role="status" className="text-ink/70">Signing you in…</p>}
      </main>
    </div>
  )
}
