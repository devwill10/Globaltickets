import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserCircle, Briefcase } from 'lucide-react'
import Stepper from '../components/Stepper'
import Field from '../components/Field'
import { COUNTRIES } from '../data/events'
import { registerUser, resendVerification } from '../services/auth'

const STEPS = ['Type of account', 'About you', 'Email confirmation']
const REFERRALS = ['Social media', 'Friend or word of mouth', 'Search engine', 'An event I attended', 'Other']
const initial = { country: '', businessName: '', firstName: '', middleName: '', lastName: '', email: '', password: '', confirmPassword: '', referral: '' }

const ACCOUNT_TYPES = [
  { id: 'individual', title: 'Individual', icon: UserCircle, text: 'Create and sell tickets to your events as an individual.', enabled: true },
  { id: 'organisation', title: 'Organisation', icon: Briefcase, text: 'Create and sell tickets to events as a registered business.', enabled: true },
]

function validate(v, type) {
  const e = {}
  if (!v.country) e.country = 'Please choose a location.'
  if (type === 'organisation') {
    if (!v.businessName.trim()) e.businessName = 'Enter your registered business name.'
  } else {
    if (!v.firstName.trim()) e.firstName = 'Enter your first name.'
    if (!v.lastName.trim()) e.lastName = 'Enter your last name.'
  }
  if (!v.email.trim()) e.email = 'Enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = 'Enter a valid email address.'
  if (!v.password) e.password = 'Create a password.'
  else if (v.password.length < 8 || !/[a-zA-Z]/.test(v.password) || !/\d/.test(v.password))
    e.password = 'Use at least 8 characters, with letters and numbers.'
  if (!v.confirmPassword) e.confirmPassword = 'Confirm your password.'
  else if (v.confirmPassword !== v.password) e.confirmPassword = 'Passwords do not match.'
  return e
}

const btnBase = 'rounded-lg px-6 py-4 text-base text-center transition'
const btnLight = `${btnBase} bg-[#fdece8] text-brand hover:bg-[#fbdcd3]`
const btnPrimary = `${btnBase} bg-brand text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70`

export default function Signup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [type, setType] = useState('')
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)

  const goTo = (n) => { setStep(n); window.scrollTo(0, 0) }
  const change = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }))
  }
  const field = (name) => ({ name, value: values[name], onChange: change, error: errors[name] })

  async function submit(e) {
    e.preventDefault()
    const errs = validate(values, type)
    setErrors(errs)
    setServerError('')
    const first = Object.keys(errs)[0]
    if (first) { document.getElementById(`field-${first}`)?.focus(); return }

    setLoading(true)
    try {
      // Never send the confirmation field; send only the fields that apply to this account type.
      const { confirmPassword, firstName, middleName, lastName, businessName, ...common } = values
      const payload = type === 'organisation' ? { ...common, businessName } : { ...common, firstName, middleName, lastName }
      await registerUser({ ...payload, accountType: type })
      goTo(2)
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function resend() {
    await resendVerification(values.email)
    setResent(true)
  }

  return (
    <div className="mt-14">
      <h1 className="text-4xl font-bold md:text-5xl">Create an account</h1>
      <p className="mt-4 text-ink/70">
        {step === 2 ? "It's free to create an account and get started with TicketsGlobal!" : 'Give us a few details and start creating events on TicketsGlobal.'}
      </p>
      <div className="mt-10"><Stepper steps={STEPS} current={step} /></div>

      {/* Step 1: account type */}
      {step === 0 && (
        <section className="mt-12">
          <h2 className="font-bold">Choose a type of account</h2>
          <div role="radiogroup" aria-label="Type of account" className="mt-6 grid gap-5 sm:grid-cols-2">
            {ACCOUNT_TYPES.map(({ id, title, icon: Icon, text, enabled }) => (
              <label key={id}
                className={`relative flex flex-col items-center rounded-xl border px-6 py-10 text-center focus-within:ring-2 focus-within:ring-brand/40 ${
                  !enabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-brand'
                } ${type === id ? 'border-brand bg-blush' : 'border-ink/15'}`}>
                <input type="radio" name="accountType" value={id} disabled={!enabled}
                  checked={type === id} onChange={() => { setType(id); setErrors({}) }} className="sr-only" />
                {!enabled && <span className="absolute right-3 top-3 rounded-full bg-gray-100 px-2.5 py-1 text-xs">Coming soon</span>}
                <Icon size={64} strokeWidth={1} className="text-indigo-300" />
                <span className="mt-5 text-2xl font-bold">{title}</span>
                <span className="mt-3 text-ink/80">{text}</span>
                <span aria-hidden="true" className={`mt-8 h-7 w-7 rounded-full border-2 ${type === id ? 'border-brand bg-brand shadow-[inset_0_0_0_4px_white]' : 'border-ink/20'}`} />
              </label>
            ))}
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <button type="button" onClick={() => navigate('/')} className={btnLight}>Cancel</button>
            <button type="button" disabled={!type} onClick={() => goTo(1)}
              className={type ? btnPrimary : `${btnBase} cursor-not-allowed bg-gray-100 text-gray-400`}>Continue</button>
          </div>
        </section>
      )}

      {/* Step 2: about you */}
      {step === 1 && (
        <form onSubmit={submit} noValidate className="mt-12">
          <h2 className="font-bold">Tell us about yourself</h2>
          <p className="mt-1 text-sm text-ink/70">Please, use the name on your bank account. We'll verify it when you set up payouts.</p>

          {serverError && <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}

          <div className="mt-6 space-y-6">
            <Field {...field('country')} label="Location of event" required options={COUNTRIES} placeholder="Location of event" />
            {type === 'organisation' ? (
              <Field {...field('businessName')} label="Registered business name" required placeholder="Business name" autoComplete="organization" />
            ) : (
              <>
                <Field {...field('firstName')} label="First name" required placeholder="First name" autoComplete="given-name" />
                <Field {...field('middleName')} label="Middle name" optional placeholder="Middle name" autoComplete="additional-name" />
                <Field {...field('lastName')} label="Last name" required placeholder="Last name" autoComplete="family-name" />
              </>
            )}
            <Field {...field('email')} label="Email address" required type="email" placeholder="Email address" autoComplete="email" />
            <Field {...field('password')} label="Password" required type="password" placeholder="Password" autoComplete="new-password" hint="At least 8 characters, with letters and numbers." />
            <Field {...field('confirmPassword')} label="Confirm password" required type="password" placeholder="Confirm password" autoComplete="new-password" />
            <Field {...field('referral')} label="How did you hear about TicketsGlobal?" options={REFERRALS} placeholder="How did you hear about us?" />
          </div>

          <p className="mt-6 rounded-lg bg-gray-100 px-5 py-5 text-ink/70">
            By clicking Sign Up, I agree to the TicketsGlobal{' '}
            <Link to="/terms" className="underline hover:text-brand">Terms and Conditions</Link> and{' '}
            <Link to="/privacy" className="underline hover:text-brand">Privacy Policy</Link>
          </p>

          {/* TODO: add bot protection here (e.g. Cloudflare Turnstile) and verify the token on your server. */}

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <button type="button" onClick={() => goTo(0)} className={btnLight}>Go back</button>
            <button type="submit" disabled={loading} className={btnPrimary}>{loading ? 'Creating account…' : 'Sign up'}</button>
          </div>
        </form>
      )}

      {/* Step 3: confirm email */}
      {step === 2 && (
        <section className="mt-12">
          <h2 className="font-bold">Confirm your email</h2>
          <p className="mt-6 text-ink/70">One last thing, and you're all set!</p>
          <p className="mt-4 text-ink/70">
            We've sent an email to <strong className="text-ink">{values.email}</strong>. Click the link in the email to confirm your account.
          </p>
          <Link to="/login" className={`${btnPrimary} mt-10 block`}>Sign in</Link>
          <p className="mt-5 text-center text-sm text-ink/70">
            {resent ? 'Verification email sent again.' : (<>Didn't get it?{' '}
              <button type="button" onClick={resend} className="text-brand underline">Resend email</button></>)}
          </p>
        </section>
      )}

      {step < 2 && (
        <p className="mt-10 text-sm text-ink/70">
          Already have an account? <Link to="/login" className="text-brand underline">Log in</Link>
        </p>
      )}
    </div>
  )
}
