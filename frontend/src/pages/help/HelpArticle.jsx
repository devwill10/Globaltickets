import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { articleBySlug, byCategory, categoryById, slugify } from '../../data/help'
import { Blocks, CategoryPill } from './HelpBits'

const fmt = (iso) => iso.split('-').reverse().join('/') // 21/11/2026

export default function HelpArticle() {
  const { slug } = useParams()
  const a = articleBySlug(slug)
  const [vote, setVote] = useState(null)
  useEffect(() => { setVote(null); document.title = `${a?.title ?? 'Help'} | TicketsGlobal Help` }, [a])

  if (!a) return <p className="mx-auto max-w-5xl px-5 pt-12">We couldn't find that article. <Link to="/help" className="text-brand underline">Back to the help center</Link></p>
  const cat = categoryById(a.category)
  const related = byCategory(a.category).filter((r) => r.slug !== a.slug)
  const headings = a.body.filter(([t]) => t === 'h').map(([, h]) => h)

  return (
    <div className="mt-0 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-8 md:flex-row md:gap-14">
        <aside className="md:w-60 md:shrink-0">
          <div className="flex items-center gap-3">
            <Link to={`/help/category/${cat.id}`} aria-label={`Back to ${cat.name}`}><ArrowLeft size={18} /></Link>
            <CategoryPill cat={cat} />
          </div>
          {related.length > 0 && (
            <nav aria-label="Related articles" className="mt-8">
              <p className="text-sm font-bold">Related articles</p>
              <ul className="mt-4 space-y-3 text-sm">
                {related.map((r) => <li key={r.slug}><Link to={`/help/articles/${r.slug}`} className="hover:text-brand">{r.title}</Link></li>)}
              </ul>
            </nav>
          )}
        </aside>

        <article className="min-w-0 max-w-3xl flex-1 pb-6 text-[15px]">
          <p className="text-sm">Articles on: <Link to={`/help/category/${cat.id}`} className="text-brand hover:underline">{cat.name}</Link></p>
          <h1 className="mt-3 border-b border-ink/10 pb-5 text-3xl font-bold">{a.title}</h1>

          {headings.length >= 3 && (
            <nav aria-label="On this page" className="mt-6 rounded-lg bg-blush p-4 text-sm">
              <p className="font-bold">In this article</p>
              <ul className="mt-2 space-y-1">{headings.map((h) => <li key={h}><a href={`#${slugify(h)}`} className="text-brand hover:underline">{h}</a></li>)}</ul>
            </nav>
          )}
          <div className="-mt-2"><Blocks blocks={a.body} /></div>

          <p className="mt-12 flex items-center justify-center gap-2 border-y border-ink/10 py-5 text-xs text-ink/70"><CalendarDays size={14} />Updated on: {fmt(a.updated)}</p>

          <div className="mt-8 text-center" role="group" aria-label="Was this article helpful?">
            {vote === null ? (
              <div className="flex items-center justify-center gap-3 text-sm font-semibold">
                <span>Was this article helpful?</span>
                <button type="button" onClick={() => setVote('yes')} className="rounded-md bg-ink/[0.07] px-5 py-2 hover:bg-ink/10">Yes</button>
                <button type="button" onClick={() => setVote('no')} className="rounded-md bg-ink/[0.07] px-5 py-2 hover:bg-ink/10">No</button>
              </div>
            ) : vote === 'yes' ? (
              <p className="text-sm font-medium" role="status">Great, glad it helped!</p>
            ) : (
              <p className="text-sm" role="status">Sorry about that. <a href="mailto:support@ticketsglobal.com" className="font-medium text-brand underline">Contact us</a> and we'll help.</p>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}
