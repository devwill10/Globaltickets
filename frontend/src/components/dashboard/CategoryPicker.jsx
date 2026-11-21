import { useState } from 'react'
import { X } from 'lucide-react'
import { TAGS, VISIBLE_TAGS } from '../../data/eventOptions'

const chip = 'rounded border border-ink px-2.5 py-1 text-xs hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink disabled:hover:text-ink'

export default function CategoryPicker({ value, onChange }) {
  const [more, setMore] = useState(false)
  const names = TAGS.map(([t]) => t)
  const list = (more ? names : names.slice(0, VISIBLE_TAGS)).filter((t) => !value.includes(t))
  const full = value.length >= 2

  return (
    <div id="f-tags" tabIndex={-1}>
      <div className="flex flex-wrap gap-2">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5 rounded border border-brand bg-blush px-2.5 py-1 text-xs">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))}><X size={12} /></button>
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {list.map((t) => (
          <button key={t} type="button" disabled={full} onClick={() => onChange([...value, t])} className={chip}>{t}</button>
        ))}
      </div>
      <button type="button" onClick={() => setMore(!more)} className="mt-3 text-xs text-brand hover:underline">{more ? 'See less' : 'See more'}</button>
    </div>
  )
}
