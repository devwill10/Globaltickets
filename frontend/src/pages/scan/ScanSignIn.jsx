import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Modal from '../../components/Modal'
import { getStaff, staffSignIn, scanPath } from '../../services/scan'

export default function ScanSignIn() {
  const nav = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [help, setHelp] = useState(false)
  if (getStaff()) return <Navigate to={scanPath('/events')} replace />

  async function submit(e) {
    e.preventDefault()
    if (!code.trim() || busy) return
    setBusy(true); setError('')
    try { await staffSignIn(code); nav(scanPath('/events'), { replace: true }) }
    catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-dvh px-6 py-8 sm:px-12">
      <span className="text-4xl font-medium tracking-tight text-brand">ticketsglobal</span>
      <form onSubmit={submit} className="mx-auto mt-16 max-w-md sm:mt-24">
        <h1 className="text-3xl font-bold">Hi,</h1>
        <p className="mt-2 text-lg">Type in your passcode to check in attendees and guests.</p>

        <label htmlFor="code" className="mt-14 block text-ink/70"><span className="mr-1 text-red-600">*</span>Log in code</label>
        <input id="code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} maxLength={32}
          aria-invalid={Boolean(error)} aria-describedby={error ? 'code-error' : undefined}
          className={`mt-3 w-full rounded-xl border px-4 py-4 outline-none focus:border-brand ${error ? 'border-red-400' : 'border-ink/20'}`} />
        {error && <p id="code-error" role="alert" className="mt-2 text-sm text-red-600">{error}</p>}

        <button type="button" onClick={() => setHelp(true)} className="mt-5 text-left font-medium underline-offset-2 hover:underline">How to get your staff passcode.</button>
        <button type="submit" disabled={!code.trim() || busy}
          className="mt-14 w-full rounded-xl bg-brand py-4 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/50">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {help && (
        <Modal title="Your staff passcode" onClose={() => setHelp(false)}>
          <p className="text-sm leading-relaxed text-ink/80">Your passcode is created by the event organiser. Ask them to open <strong>Dashboard → Account → Staff</strong>, add you as a team member, and send you the code shown next to your name.</p>
        </Modal>
      )}
    </div>
  )
}
