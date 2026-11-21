import { Link } from 'react-router-dom'
import { MessagesSquare } from 'lucide-react'
import FeatureSection from '../components/FeatureSection'
import Accordion from '../components/Accordion'
import { heroStories, featureSections, faqs } from '../data/howItWorks'

export default function HowItWorks() {
  return (
    <>
      {/* Hero */}
      <section className="px-5 pb-16 pt-16 text-center md:pt-24">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          Bring your next event to life in less than <span className="font-medium italic text-brand">10</span> minutes.
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg">
          Create events, sell tickets, and reach your audience easily. TicketsGlobal gives you the tools to create a memorable experience from start to finish.
        </p>
        <Link to="/dashboard/events/new"
          className="mt-10 inline-block w-full max-w-sm rounded-md bg-brand py-4 text-sm font-medium text-white hover:bg-brand-dark">
          Create an event for free
        </Link>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 text-left md:grid-cols-2">
          {heroStories.map((s) => (
            <figure key={s.text}>
              {s.image
                ? <img src={s.image} alt="" className="aspect-square w-full rounded-3xl object-cover" />
                : <div aria-hidden="true" className="aspect-square w-full rounded-3xl"
                    style={{ background: `linear-gradient(145deg, hsl(${s.hue} 70% 25%), hsl(${s.hue + 40} 60% 8%))` }} />}
              <figcaption className="mt-5 text-sm leading-relaxed text-ink/70">{s.text}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {featureSections.map((s) => <FeatureSection key={s.id} section={s} />)}

      {/* FAQ */}
      <section className="px-5 pb-20 pt-20">
        <h2 className="text-center text-4xl font-bold">Frequently Asked Questions</h2>
        <div className="mx-auto mt-14 max-w-2xl"><Accordion items={faqs} size="md" /></div>

        <div className="mx-auto mt-20 max-w-3xl rounded-3xl bg-brand px-6 py-14 text-center text-white">
          <MessagesSquare size={48} className="mx-auto" />
          <h2 className="mt-6 text-4xl font-bold">Have more questions?</h2>
          <p className="mt-4">Reach out to us. We are happy to help!</p>
          <a href="mailto:support@ticketsglobal.com"
            className="mt-8 inline-block w-full max-w-xs rounded-md bg-white py-4 text-sm text-brand hover:bg-blush">
            Contact Us
          </a>
        </div>
      </section>
    </>
  )
}
