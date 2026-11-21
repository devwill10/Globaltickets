import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Field from '../components/Field'
import { updatePassword } from '../services/auth'
import { passwordError } from '../utils/validate'
import { useAuthStore } from '../store/authStore'

// Opened from the password-reset email. Supabase signs the user in with a recovery session first.
export default function UpdatePassword() {
  const user = useAuthStore((s) => s.user)
  const [waited, setWaited] = useState(false)
  const [values, setValues] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  useEffect(() => { const t = setTimeout(() => setWaited(true), 3000); return () => clearTimeout(t) }, [])

  const change = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: undefined }))
  }

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    const pe = passwordError(values.password)
    if (pe) errs.password = pe
    if (!values.confirmPassword) errs.confirmPassword = 'Confirm your password.'
    else if (values.confirmPassword !== values.password) errs.confirmPassword = 'Passwords do not match.'
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) { document.getElementById(`field-${first}`)?.focus(); return }
    setLoading(true); setServerError('')
    try { await updatePassword(values.password); setDone(true) }
    catch (err) { setServerError(err.message) }
    finally { setLoading(false) }
  }

  if (done) return (
    <div className="mt-20">
      <h1 className="text-4xl font-bold md:text-5xl">Password updated</h1>
      <p className="mt-4 text-ink/70">You're signed in with your new password.</p>
      <Link to="/dashboard" className="mt-10 block max-w-md rounded-lg bg-brand px-6 py-4 text-center text-white hover:bg-brand-dark">Go to Dashboard</Link>
    </div>
  )

  if (!user && waited) return (
    <div className="mt-20">
      <h1 className="text-4xl font-bold md:text-5xl">Link expired</h1>
      <p className="mt-4 max-w-md text-ink/70">This reset link is invalid or has expired. Request a new one.</p>
      <Link to="/reset-password" className="mt-10 block max-w-md rounded-lg bg-brand px-6 py-4 text-center text-white hover:bg-brand-dark">Reset password</Link>
    </div>
  )

  return (
    <div className="mt-20">
      <h1 className="text-4xl font-bold md:text-5xl">Choose a new password</h1>
      <p className="mt-4 text-ink/70">Enter a new password for your account.</p>
      <form onSubmit={submit} noValidate className="mt-12 max-w-md space-y-6">
        {serverError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}
        <Field name="password" label="New password" required type="password" autoComplete="new-password"
          value={values.password} onChange={change} error={errors.password} hint="At least 8 characters, with letters and numbers." />
        <Field name="confirmPassword" label="Confirm password" required type="password" autoComplete="new-password"
          value={values.confirmPassword} onChange={change} error={errors.confirmPassword} />
        <button type="submit" disabled={loading || !user}
          className="w-full rounded-lg bg-brand px-6 py-4 text-base text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
