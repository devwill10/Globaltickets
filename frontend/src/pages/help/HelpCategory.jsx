import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { byCategory, categoryById } from '../../data/help'
import { ArticleRow, CategoryPill } from './HelpBits'

export default function HelpCategory() {
  const { cat } = useParams()
  const c = categoryById(cat)
  useEffect(() => { document.title = `${c?.name ?? 'Help'} | TicketsGlobal Help` }, [c])
  if (!c) return <p className="mx-auto max-w-5xl px-5 pt-12">We couldn't find that category. <Link to="/help" className="text-brand underline">Back to the help center</Link></p>
  return (
    <div className="mx-auto max-w-3xl px-5 pt-10">
      <Link to="/help" className="inline-flex items-center gap-2 text-sm font-medium text-brand"><ArrowLeft size={16} />All categories</Link>
      <div className="mt-5"><CategoryPill cat={c} /></div>
      <p className="mt-4 text-sm leading-relaxed">{c.text}</p>
      <div className="mt-8 grid gap-3">{byCategory(c.id).map((a) => <ArticleRow key={a.slug} article={a} />)}</div>
    </div>
  )
}
