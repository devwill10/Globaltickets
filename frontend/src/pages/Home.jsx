import { Link } from 'react-router-dom'
import { Users, Drama, Trophy, Presentation, Flower2, Pizza } from 'lucide-react'
import Testimonials from '../components/Testimonials'
import PartnerMarquee from '../components/PartnerMarquee'

// Put your own image at src/assets/hero.jpg and import it here, e.g.
// import heroImg from '../assets/hero.jpg'  then set HERO_IMAGE = heroImg
const HERO_IMAGE = null

const categories = [
  { label: 'Community', icon: Users },
  { label: 'Art & Culture', icon: Drama },
  { label: 'Sports & Wellness', icon: Trophy },
  { label: 'Career & Business', icon: Presentation },
  { label: 'Spirituality & Religion', icon: Flower2 },
  { label: 'Food & Drink', icon: Pizza },
]

const features = [
  { title: 'Ticketing anywhere', text: 'Create, promote, and sell tickets to your live or virtual events on mobile.', tone: 'bg-orange-50' },
  { title: 'Custom Box Office', text: 'Group similar events into branded collections and embed them on your website without coding.', tone: 'bg-yellow-50' },
  { title: 'Smooth checkouts', text: 'Give attendees multiple ways to pay for tickets, all with quick confirmation.', tone: 'bg-slate-100' },
  { title: 'Real-time data', text: 'See ticket sales, revenue, and payouts on a simple dashboard.', tone: 'bg-slate-100' },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative flex min-h-[600px] items-center justify-center bg-ink bg-cover bg-center px-5 text-center text-white md:min-h-[720px]"
        style={HERO_IMAGE
          ? { backgroundImage: `linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)), url(${HERO_IMAGE})` }
          : { backgroundImage: 'radial-gradient(circle at 30% 30%, #7a3a22 0%, #2a1a16 45%, #121018 100%)' }}
      >
        <div className="max-w-2xl pt-16">
          <h1 className="text-5xl font-bold leading-tight md:text-6xl">Discover an experience to remember</h1>
          <p className="mx-auto mt-6 max-w-md text-lg">
            Explore concerts, raves, exhibitions, and other live events happening around you.
          </p>
          <Link to="/events"
            className="mt-10 inline-block rounded-md bg-brand px-10 py-4 text-sm font-medium hover:bg-brand-dark">
            Discover an experience
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="max-w-sm text-4xl font-bold leading-tight md:text-5xl">What are you in the mood for?</h2>
          <p className="max-w-xs text-sm text-ink/80">
            Whether you're looking for fun times or a place to learn, there's something for you on TicketsGlobal.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map(({ label, icon: Icon }) => (
            <Link key={label} to={`/events?category=${encodeURIComponent(label)}`}
              className="group flex flex-col items-center text-center">
              <Icon size={84} strokeWidth={1.1} className="text-gray-400 transition group-hover:text-brand" />
              <span className="mt-5 text-sm font-bold">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* For organisers */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2">
        <div>
          <h2 className="text-4xl font-bold leading-tight md:text-5xl">For first-time planners and expert organisers</h2>
          <p className="mt-6 max-w-md text-lg">
            Set up your event in minutes, reach the right audience, and get paid easily.
          </p>
          <Link to="/dashboard/events/new"
            className="mt-10 inline-block w-full max-w-xs rounded-md border border-brand px-8 py-4 text-center text-brand hover:bg-brand hover:text-white">
            Create an event
          </Link>
        </div>

        {/* Replace this mock with a real screenshot/image later */}
        <div className="relative mx-auto h-[380px] w-full max-w-lg rounded-3xl bg-gradient-to-br from-amber-700 via-orange-900 to-stone-900">
          <div className="absolute left-4 top-6 rounded-lg bg-white px-4 py-3 text-center shadow-lg">
            <p className="text-xs text-brand">Your Earnings</p>
            <p className="text-xl font-bold text-brand">₦70,000</p>
          </div>
          <div className="absolute -right-3 top-16 flex items-center gap-3 rounded-lg bg-white p-3 shadow-lg">
            <span className="rounded bg-orange-50 px-3 py-2 text-2xl font-semibold text-brand">40%</span>
            <div>
              <p className="text-xs font-bold">Total Checkins</p>
              <p className="text-[10px] text-ink/60">400/1,000</p>
              <div className="mt-1 h-1 w-28 rounded bg-gray-200"><div className="h-1 w-2/5 rounded bg-brand" /></div>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-3 w-56 rounded-lg bg-white p-4 shadow-lg">
            <p className="text-sm font-bold">What kind of ticket is it?</p>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="rounded border px-3 py-1.5">Free</span>
              <span className="rounded bg-orange-100 px-3 py-1.5 text-brand">Paid</span>
              <span className="rounded border px-3 py-1.5">Invite only</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tagline */}
      <section className="px-5 pb-12 pt-24 text-center">
        <h2 className="mx-auto max-w-lg text-4xl font-bold leading-tight md:text-5xl">The way ticketing should be</h2>
        <p className="mt-6">TicketsGlobal is the simple way to buy and sell event tickets.</p>
        <Link to="/how-it-works"
          className="mt-10 inline-block rounded-md border border-brand px-16 py-4 text-brand hover:bg-brand hover:text-white">
          See how it works
        </Link>
      </section>

      {/* Features */}
      <section className="bg-gradient-to-b from-white to-blush px-5 pb-24 pt-8">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {features.map((f, n) => (
            <div key={f.title} className={`rounded-3xl bg-white p-4 ${n % 2 ? 'md:mt-16' : ''}`}>
              {/* Replace the tinted block with a screenshot of that feature */}
              <div className={`h-60 rounded-2xl ${f.tone}`} />
              <h3 className="mt-6 text-2xl font-bold">{f.title}</h3>
              <p className="mt-2 text-lg">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Testimonials />
      <PartnerMarquee />
    </>
  )
}
