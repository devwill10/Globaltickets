import { useEffect, useState } from 'react'
import FilterDropdown from '../components/FilterDropdown'
import HighlightedEventCard from '../components/HighlightedEventCard'
import EventCard from '../components/EventCard'
import AppBanner from '../components/AppBanner'
import { COUNTRIES, CATEGORIES } from '../data/events'
import { listEvents, listHighlighted } from '../services/events'

const countryOptions = COUNTRIES.map((c) => ({ value: c, label: c }))
const categoryOptions = [{ value: 'all', label: 'All Events' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]
const priceOptions = [{ value: 'all', label: 'Price' }, { value: 'free', label: 'Free' }, { value: 'paid', label: 'Paid' }]
const dateOptions = [
  { value: 'all', label: 'Date' }, { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' }, { value: 'month', label: 'This month' },
]
const PAGE_SIZE = 10

export default function Events() {
  const [country, setCountry] = useState('Nigeria')
  const [category, setCategory] = useState('all')
  const [price, setPrice] = useState('all')
  const [date, setDate] = useState('all')
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [highlighted, setHighlighted] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let off = false
    listHighlighted(country).then((h) => !off && setHighlighted(h)).catch(() => !off && setHighlighted([]))
    return () => { off = true }
  }, [country])

  useEffect(() => {
    let off = false
    setLoading(true); setError('')
    listEvents({ country, category, price, date, limit })
      .then(({ items, total }) => { if (!off) { setItems(items); setTotal(total) } })
      .catch(() => { if (!off) setError("We couldn't load events. Please try again.") })
      .finally(() => { if (!off) setLoading(false) })
    return () => { off = true }
  }, [country, category, price, date, limit, attempt])

  const onFilter = (setter) => (v) => { setter(v); setLimit(PAGE_SIZE) }
  const clear = () => { setCategory('all'); setPrice('all'); setDate('all'); setLimit(PAGE_SIZE) }
  const hasMore = items.length < total
  const loadMore = () => setLimit((l) => l + PAGE_SIZE)

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-8">
      <p className="text-xl text-ink/60">Find an event in:</p>
      <div className="mt-4">
        <FilterDropdown variant="plain" options={countryOptions} value={country}
          onChange={(v) => { setCountry(v); clear() }} />
      </div>

      {highlighted.length > 0 && (
        <div className="-mx-5 mt-10 flex gap-5 overflow-x-auto px-5 pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
          {highlighted.map((e) => <HighlightedEventCard key={e.id} event={e} />)}
        </div>
      )}

      <div className="mt-12"><AppBanner /></div>

      <div className="mt-12 flex flex-wrap gap-4">
        <FilterDropdown options={categoryOptions} value={category} onChange={onFilter(setCategory)} active />
        <FilterDropdown options={priceOptions} value={price} onChange={onFilter(setPrice)} active={price !== 'all'} />
        <FilterDropdown options={dateOptions} value={date} onChange={onFilter(setDate)} active={date !== 'all'} />
      </div>

      <div className="mt-12 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Popular Events</h2>
        {hasMore && <button onClick={loadMore} className="text-sm font-bold text-brand hover:underline">See all</button>}
      </div>

      {error ? (
        <div role="alert" className="mt-8 rounded-lg border border-red-200 bg-red-50 py-10 text-center">
          <p className="text-red-700">{error}</p>
          <button onClick={() => setAttempt((a) => a + 1)} className="mt-4 rounded-md border border-red-300 px-6 py-2 text-sm text-red-700 hover:bg-red-100">Try again</button>
        </div>
      ) : loading && items.length === 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-100" />)}
        </div>
      ) : items.length > 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {items.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-ink/20 py-16 text-center">
          <p className="font-bold">No events match these filters</p>
          <p className="mt-1 text-sm text-ink/60">Try a different category, price or date.</p>
          <button onClick={clear} className="mt-5 rounded-md border border-brand px-6 py-2 text-sm text-brand hover:bg-brand hover:text-white">Clear filters</button>
        </div>
      )}

      {hasMore && !error && (
        <div className="mt-12 text-center">
          <button onClick={loadMore} disabled={loading}
            className="w-full max-w-sm rounded-md bg-brand py-4 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-70">
            {loading ? 'Loading…' : 'See more events'}
          </button>
        </div>
      )}
    </div>
  )
}
