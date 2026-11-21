import { useState } from 'react'
import { Link } from 'react-router-dom'
import Field from '../components/Field'
import { loginUser } from '../services/auth'

export default function Login() {
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const change = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }))
  }
  const field = (name) => ({ name, value: values[name], onChange: change, error: errors[name] })

  async function submit(e) {
    e.preventDefault()
    setServerError('')
    const errs = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errs.email = 'Please enter a valid email address'
    if (!values.password) errs.password = 'Please enter your password'
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) { document.getElementById(`field-${first}`)?.focus(); return }

    setLoading(true)
    try {
      await loginUser({ email: values.email.trim(), password: values.password })
      // The auth store picks up the new session and AuthLayout redirects to the dashboard.
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="mt-20">
      <h1 className="text-4xl font-bold md:text-5xl">Welcome back</h1>
      <p className="mt-4 text-ink/70">Sign in to see your dashboard.</p>

      <form onSubmit={submit} noValidate className="mt-12 max-w-md space-y-6">
        {serverError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}

        <Field {...field('email')} label="Email address" required type="email" autoComplete="email" />
        <Field {...field('password')} label="Password" required type="password" autoComplete="current-password" />

        {/* TODO: add bot protection here (e.g. Cloudflare Turnstile) and verify the token on your server. */}

        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-brand px-6 py-4 text-base text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-8 text-ink/70">
        Forgot your password? <Link to="/reset-password" className="text-brand hover:underline">Reset it.</Link>
      </p>
      <p className="mt-3 text-ink/70">
        Got tickets but never set a password?{' '}
        <Link to="/tickets/sign-in" state={{ email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) ? values.email.trim() : '' }}
          className="text-brand hover:underline">Email me a sign-in link.</Link>
      </p>
      <p className="mt-24 text-ink/70">
        Not on TicketsGlobal? <Link to="/signup" className="text-brand hover:underline">Create an account.</Link>
      </p>
    </div>
  )
}
