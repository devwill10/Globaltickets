import { useState } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

// Replace with real testimonials later
const items = [
  { quote: 'Working with TicketsGlobal as our ticketing partner has been a seamless experience for us. From creating events to ensuring smooth customer access, the platform has proven to be exceptional. Payment processing is quick and secure, and customer service is always responsive.', name: 'Sporting Lagos' },
  { quote: 'We sold out in days. Setting up tiers, tracking sales and checking guests in at the gate was effortless.', name: 'Rhythm & Brunch' },
  { quote: 'Our fans buy tickets in under a minute, and payouts are clear and on time.', name: 'Afro Future' },
  { quote: 'The dashboard shows exactly what we have sold and earned, in real time.', name: 'Group Therapy' },
  { quote: 'Free and paid events on one platform made our community programming much easier to run.', name: 'Art X Lagos' },
  { quote: 'Support was quick whenever we needed help on event day.', name: 'Mullar Soundsystem' },
]

export default function Testimonials() {
  const [i, setI] = useState(0)
  const prev = () => setI((i - 1 + items.length) % items.length)
  const next = () => setI((i + 1) % items.length)

  return (
    <section className="bg-blush px-5 py-24">
      <h2 className="mx-auto max-w-md text-center text-4xl font-bold leading-tight md:text-5xl">
        Real people, real rave reviews!
      </h2>
      <div className="mx-auto mt-14 flex max-w-4xl items-center gap-4 md:gap-8">
        <button onClick={prev} aria-label="Previous review"
          className="hidden h-11 w-11 shrink-0 place-items-center rounded-full border border-brand text-brand hover:bg-brand hover:text-white sm:grid">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 text-center">
          <Quote className="mx-auto fill-brand text-brand" size={34} />
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed">"{items[i].quote}"</p>
          <p className="mt-8 font-bold">{items[i].name}</p>
        </div>
        <button onClick={next} aria-label="Next review"
          className="hidden h-11 w-11 shrink-0 place-items-center rounded-full border border-brand text-brand hover:bg-brand hover:text-white sm:grid">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="mt-8 flex justify-center gap-2">
        {items.map((_, n) => (
          <button key={n} onClick={() => setI(n)} aria-label={`Review ${n + 1}`}
            className={`h-2 w-2 rounded-full ${n === i ? 'bg-brand' : 'bg-ink/15'}`} />
        ))}
      </div>
    </section>
  )
}
