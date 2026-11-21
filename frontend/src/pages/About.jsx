import { MessagesSquare } from 'lucide-react'
import ContactCta from '../components/ContactCta'
import { aboutHero, aboutCards } from '../data/about'

export default function About() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-10">
      <section>
        <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl">{aboutHero.title}</h1>
        <p className="mt-10 max-w-xl leading-relaxed">{aboutHero.text}</p>

        {aboutHero.image ? (
          <img src={aboutHero.image} alt="" className="mt-14 aspect-[1.6] w-full rounded-3xl object-cover" />
        ) : (
          <div aria-hidden="true" className="mt-14 aspect-[1.6] w-full rounded-3xl"
            style={{ background: 'radial-gradient(circle at 70% 70%, #3b5bff55, transparent 40%), radial-gradient(circle at 25% 60%, #ff3b6b66, transparent 45%), #0a0508' }} />
        )}
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        {aboutCards.map((c) => (
          <article key={c.title} className="rounded-3xl bg-gray-50 p-8 md:p-10">
            <h2 className="text-xl font-bold">{c.title}</h2>
            <div className="mt-6 space-y-5 text-sm leading-relaxed">
              {c.paragraphs.map((p) => <p key={p}>{p}</p>)}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-24">
        <ContactCta
          icon={<MessagesSquare size={48} className="mx-auto mb-6" />}
          title="Have any questions?"
          text="Reach out to us. We are happy to help!"
        />
      </section>
    </div>
  )
}
