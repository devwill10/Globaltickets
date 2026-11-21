import { useEffect, useState } from 'react'
import { CalendarDays, Ticket, Wand2, BarChart3, Megaphone, ShieldCheck } from 'lucide-react'
import FilterDropdown from '../components/FilterDropdown'
import ContactCta from '../components/ContactCta'
import { formatFee, pricingCards, customServices } from '../data/pricing'
import { getPricing } from '../services/pricing'

const icons = { CalendarDays, Ticket, Wand2, BarChart3, Megaphone, ShieldCheck }

export default function Pricing() {
  const [pricing, setPricing] = useState(null)
  const [country, setCountry] = useState('Nigeria')
  const [error, setError] = useState('')

  useEffect(() => {
    let off = false
    getPricing()
      .then((p) => { if (!off) { setPricing(p); setCountry((c) => (p[c] ? c : Object.keys(p)[0])) } })
      .catch(() => { if (!off) setError("We couldn't load pricing. Please refresh the page.") })
    return () => { off = true }
  }, [])

  const rate = pricing?.[country]
  const fee = rate ? formatFee(rate) : '…'
  const countryOptions = (pricing ? Object.keys(pricing) : [country]).map((c) => ({ value: c, label: c }))
  const cards = pricingCards(fee)

  return (
    <div className="px-5 pb-24 pt-10">
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold md:text-5xl">Free to sign up. Simple pricing.</h1>
        <p className="mx-auto mt-5 max-w-lg">
          TicketsGlobal is completely free for organising free events. When you sell paid tickets, a small fee applies.
        </p>
        <div className="mt-14 flex justify-center">
          <FilterDropdown variant="inline" options={countryOptions} value={country} onChange={setCountry} />
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="mx-auto mt-6 max-w-md rounded-2xl border border-brand/40 bg-blush px-6 py-8">
          <p className="text-4xl font-bold">{fee}</p>
          <p className="mt-3 text-brand">per paid ticket</p>
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-5xl gap-6 md:grid-cols-3">
        {cards.map((c) => {
          const Icon = icons[c.icon]
          return (
            <article key={c.id} className="rounded-2xl border border-ink/5 bg-white p-6 shadow-md">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-blush text-brand"><Icon size={20} /></span>
              <h2 className="mt-5 text-lg font-bold">{c.title}</h2>
              <ul className="mt-4 list-disc space-y-2.5 pl-5 text-sm text-ink/80 marker:text-ink/50">
                {c.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </article>
          )
        })}
      </section>

      <section className="mt-24">
        <ContactCta title="Have more specific needs?" text="Email us to get a quote for any of our customised services." items={customServices} />
      </section>
    </div>
  )
}
