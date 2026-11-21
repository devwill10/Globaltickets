import { useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeNewsletter } from '../services/newsletter'

const company = [
  { to: '/', label: 'Homepage' },
  { to: '/about', label: 'About Us' },
  { to: '/how-it-works', label: 'How TicketsGlobal Works' },
  { to: '/blog', label: 'Blog' },
]
const social = [
  { href: 'https://facebook.com', label: 'Facebook' },
  { href: 'https://x.com', label: 'X (Twitter)' },
  { href: 'https://instagram.com', label: 'Instagram' },
  { href: 'https://tiktok.com', label: 'Tiktok' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ type: '', text: '' })
  const [busy, setBusy] = useState(false)
  const subscribe = async (e) => {
    e.preventDefault()
    setBusy(true); setStatus({ type: '', text: '' })
    try {
      await subscribeNewsletter(email)
      setStatus({ type: 'ok', text: 'Thanks! You are subscribed.' })
      setEmail('')
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally { setBusy(false) }
  }

  return (
    <footer className="bg-blush">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div>
            <p className="text-xl font-medium text-brand">ticketsglobal</p>
            <p className="mt-5 max-w-xs text-sm text-ink/80">
              Sign up to our newsletter to receive information about upcoming events.
            </p>
            <form onSubmit={subscribe} className="mt-4 flex gap-2">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                className="w-56 rounded-md border border-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/30" />
              <button disabled={busy} className="rounded-md bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-70">
                Subscribe
              </button>
            </form>
            {status.text && (
              <p role="status" className={`mt-2 text-sm ${status.type === 'error' ? 'text-red-600' : 'text-green-700'}`}>{status.text}</p>
            )}
          </div>

          <div className="flex gap-16 text-sm">
            <div>
              <p className="font-semibold text-brand">Company</p>
              <ul className="mt-4 space-y-3">
                {company.map((c) => <li key={c.label}><Link to={c.to} className="hover:text-brand">{c.label}</Link></li>)}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-brand">Follow Us</p>
              <ul className="mt-4 space-y-3">
                {social.map((s) => (
                  <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer" className="hover:text-brand">{s.label}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 text-sm text-ink/80 md:flex-row md:justify-between">
          <p>Copyright © {new Date().getFullYear()} TicketsGlobal. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="/terms">Terms &amp; Conditions</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/refund-policy">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
