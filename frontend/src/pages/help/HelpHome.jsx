import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Star } from 'lucide-react'
import { ARTICLES, CATEGORIES, POPULAR, articleBySlug, search } from '../../data/help'
import { ArticleRow, CategoryPill } from './HelpBits'

export default function HelpHome() {
  const [params] = useSearchParams()
  const q = (params.get('q') ?? '').trim()
  useEffect(() => { document.title = 'Help center | TicketsGlobal' }, [])

  if (q) {
    const results = search(q)
    return (
      <div className="mx-auto max-w-5xl px-5 pt-10" role="region" aria-label="Search results" aria-live="polite">
        <h2 className="text-xl font-bold">{results.length} {results.length === 1 ? 'result' : 'results'} for "{q}"</h2>
        {results.length ? (
          <div className="mt-6 grid gap-3">{results.map((a) => <ArticleRow key={a.slug} article={a} />)}</div>
        ) : (
          <p className="mt-6 rounded-lg bg-white p-6 text-sm">We couldn't find an article for that. Try different words, or <a href="mailto:support@ticketsglobal.com" className="font-medium text-brand underline">contact us</a>.</p>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12">
      <h2 className="flex items-center gap-3 text-xl font-bold"><Star size={20} className="fill-slate-300 text-slate-300" />Frequently Read Articles</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">{POPULAR.map(articleBySlug).filter(Boolean).map((a) => <ArticleRow key={a.slug} article={a} />)}</div>

      <h2 className="mt-14 text-xl font-bold">Browse All Categories</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((c) => (
          <Link key={c.id} to={`/help/category/${c.id}`} className="flex flex-col items-center rounded-lg bg-white px-6 py-6 text-center shadow-sm transition hover:shadow-md">
            <CategoryPill cat={c} />
            <span className="mt-4 text-sm leading-relaxed">{c.text}</span>
            <span className="mt-3 text-xs text-ink/60">{ARTICLES.filter((a) => a.category === c.id).length} articles</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
