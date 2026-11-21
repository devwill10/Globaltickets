import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import MailPhoneArt from '../components/MailPhoneArt'
import { sendSignInLink } from '../services/auth'
import { useAuthStore } from '../store/authStore'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const COOLDOWN = 60 // seconds. Supabase allows one email per address per minute.
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// Shown after getting tickets as a guest: we email a one-time sign-in link to the address they used.
export default function TicketSignIn() {
  const { state } = useLocation()
  const user = useAuthStore((s) => s.user)
  const [email, setEmail] = useState(state?.email ?? '')
  const [stage, setStage] = useState(state?.email ? 'confirm' : 'ask') // ask | confirm | sent
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [wait, setWait] = useState(0)

  useEffect(() => {
    if (wait <= 0) return
    const id = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(id)
  }, [wait])

  // Opening the link in another tab of this browser signs this tab in too
  if (user) return <Navigate to="/dashboard/tickets" replace />

  async function send(e) {
    e?.preventDefault()
    if (!EMAIL.test(email.trim())) { setError('Enter a valid email address.'); return }
    setBusy(true); setError('')
    try { await sendSignInLink(email); setStage('sent'); setWait(COOLDOWN) }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const btn = 'rounded-md bg-brand px-5 py-3 text-sm text-white hover:bg-brand-dark disabled:opacity-60'
  const mail = <span className="break-all text-brand">{email.trim()}</span>

  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-5"><Link to="/" className="text-2xl font-medium tracking-tight text-brand">ticketsglobal</Link></header>
      <main className="grid min-h-[75vh] place-items-center px-6">
        <div className="flex flex-wrap items-center justify-center gap-10">
          <MailPhoneArt />
          <div className="max-w-sm">
            {stage === 'ask' && (
              <form onSubmit={send} noValidate>
                <h1 className="text-2xl font-bold">Find your tickets</h1>
                <p className="mt-3 text-sm text-ink/80">Enter the email you used to get your tickets and we'll send you a sign-in link.</p>
                <label htmlFor="si-email" className="mt-5 block text-xs">Email address</label>
                <input id="si-email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }}
                  aria-invalid={Boolean(error)} className="mt-1 w-full rounded-md border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-brand" />
                {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={busy} className={`${btn} mt-5`}>{busy ? 'Sending…' : 'Send sign-in link'}</button>
              </form>
            )}

            {stage === 'confirm' && (
              <div>
                <h1 className="text-2xl font-bold">Let's confirm it's you</h1>
                <p className="mt-3 text-sm text-ink/80">To keep your tickets secure, we'll email a sign-in link to {mail}.</p>
                <p className="mt-4 text-sm text-ink/80">Open the sign-in link in your email to view your tickets.</p>
                {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
                <button type="button" onClick={send} disabled={busy} className={`${btn} mt-6`}>{busy ? 'Sending…' : 'Send sign-in link'}</button>
                <button type="button" onClick={() => setStage('ask')} className="ml-4 text-xs text-brand underline">Use a different email</button>
              </div>
            )}

            {stage === 'sent' && (
              <div role="status">
                <h1 className="text-2xl font-bold">Check your email</h1>
                <p className="mt-3 text-sm text-ink/80">Please open the mail we just sent to you at {mail} and tap on the link to securely log in.</p>
                {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
                <p className="mt-6 flex flex-wrap items-center gap-3 text-xs">
                  {wait > 0 ? <span className="text-ink/70">Resend email in {mmss(wait)}</span>
                    : <button type="button" onClick={send} disabled={busy} className="text-brand underline disabled:opacity-60">{busy ? 'Sending…' : 'Resend email'}</button>}
                  <button type="button" onClick={() => { setStage('ask'); setError('') }} className="text-brand underline">Edit email address</button>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
