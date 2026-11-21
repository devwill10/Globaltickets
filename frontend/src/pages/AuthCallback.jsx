import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

// Landing page for the link in the verification email.
function readUrlError() {
  const p = new URLSearchParams(window.location.search)
  const h = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return p.get('error_description') || h.get('error_description') || ''
}

export default function AuthCallback() {
  const user = useAuthStore((s) => s.user)
  const [urlError] = useState(readUrlError)
  const [waited, setWaited] = useState(false)
  useEffect(() => { const t = setTimeout(() => setWaited(true), 4000); return () => clearTimeout(t) }, [])

  let body
  if (urlError) {
    body = (<>
      <AlertCircle className="text-red-500" size={40} />
      <h1 className="mt-6 text-4xl font-bold">Link problem</h1>
      <p className="mt-4 text-ink/70">This link is invalid or has expired. Sign up again or log in to request a new confirmation email.</p>
      <Link to="/login" className="mt-10 block max-w-md rounded-lg bg-brand px-6 py-4 text-center text-white hover:bg-brand-dark">Go to log in</Link>
    </>)
  } else if (user) {
    body = (<>
      <CheckCircle2 className="text-green-600" size={40} />
      <h1 className="mt-6 text-4xl font-bold">Email confirmed</h1>
      <p className="mt-4 text-ink/70">Your account is ready. Welcome to TicketsGlobal!</p>
      <Link to="/dashboard" className="mt-10 block max-w-md rounded-lg bg-brand px-6 py-4 text-center text-white hover:bg-brand-dark">Go to Dashboard</Link>
    </>)
  } else if (waited) {
    body = (<>
      <CheckCircle2 className="text-green-600" size={40} />
      <h1 className="mt-6 text-4xl font-bold">Almost there</h1>
      <p className="mt-4 text-ink/70">If your email was confirmed, you can now sign in.</p>
      <Link to="/login" className="mt-10 block max-w-md rounded-lg bg-brand px-6 py-4 text-center text-white hover:bg-brand-dark">Sign in</Link>
    </>)
  } else {
    body = <p className="mt-6 text-ink/70" role="status">Confirming your email…</p>
  }
  return <div className="mt-20">{body}</div>
}
