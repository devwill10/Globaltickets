import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Field from '../components/Field'
import { requestPasswordReset } from '../services/auth'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address')
      document.getElementById('field-email')?.focus()
      return
    }
    setError('')
    setLoading(true)
    try {
      await requestPasswordReset(email.trim())
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-12">
      <Link to="/login" className="inline-flex items-center gap-2 hover:text-brand">
        <ChevronLeft size={18} /> Back
      </Link>

      {sent ? (
        <div className="mt-14">
          <h1 className="text-4xl font-bold md:text-5xl">Check your email</h1>
          {/* Same message whether or not the account exists, so nobody can probe for registered emails. */}
          <p className="mt-4 max-w-md text-ink/70">
            If there is an account for <strong className="text-ink">{email}</strong>, we've sent a link to reset your password.
          </p>
          <Link to="/login" className="mt-10 block max-w-md rounded-lg bg-brand px-6 py-4 text-center text-white hover:bg-brand-dark">
            Back to sign in
          </Link>
          <button type="button" onClick={() => setSent(false)} className="mt-5 text-sm text-brand underline">
            Use a different email
          </button>
        </div>
      ) : (
        <div className="mt-14">
          <h1 className="text-4xl font-bold md:text-5xl">Reset password</h1>
          <p className="mt-4 text-ink/70">Please provide the email address used to create your account</p>

          <form onSubmit={submit} noValidate className="mt-12 max-w-md space-y-8">
            <Field name="email" label="Email address" required type="email" autoComplete="email"
              value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} error={error} />
            <button type="submit" disabled={!email.trim() || loading}
              className="w-full rounded-lg bg-brand px-6 py-4 text-base text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400">
              {loading ? 'Sending…' : 'Reset password'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
