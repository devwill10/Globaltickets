import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { slugify } from '../../data/help'

// Renders **bold** inside a string (plain text otherwise, so nothing can inject HTML)
export function Rich({ text }) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))
}

export function Blocks({ blocks }) {
  return blocks.map(([type, a, b], i) => {
    if (type === 'h') return <h2 key={i} id={slugify(a)} className="mt-10 scroll-mt-6 text-xl font-bold">{a}</h2>
    if (type === 'p') return <p key={i} className="mt-4 leading-relaxed"><Rich text={a} /></p>
    if (type === 'ul') return <ul key={i} className="mt-4 list-disc space-y-2 pl-6 marker:text-brand">{a.map((t, j) => <li key={j} className="leading-relaxed"><Rich text={t} /></li>)}</ul>
    if (type === 'ol') return <ol key={i} className="mt-4 list-decimal space-y-2 pl-6 marker:font-bold marker:text-brand">{a.map((t, j) => <li key={j} className="pl-1 leading-relaxed"><Rich text={t} /></li>)}</ol>
    if (type === 'note') return <p key={i} className="mt-5 rounded-lg border-l-4 border-brand bg-blush px-4 py-3 text-sm leading-relaxed"><Rich text={a} /></p>
    if (type === 'link') return <p key={i} className="mt-4"><Link to={a} className="font-medium text-brand underline-offset-2 hover:underline">{b} →</Link></p>
    return null
  })
}

export const CategoryPill = ({ cat, className = '' }) => (
  <span className={`inline-block rounded px-3 py-1.5 text-sm font-semibold text-white ${className}`} style={{ backgroundColor: cat.color }}>{cat.name}</span>
)

export const ArticleRow = ({ article }) => (
  <Link to={`/help/articles/${article.slug}`} className="flex items-center justify-between gap-4 rounded-lg bg-white px-5 py-4 text-sm font-semibold shadow-sm transition hover:shadow-md">
    <span>{article.title}</span><ChevronRight size={16} className="shrink-0" />
  </Link>
)
