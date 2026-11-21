import { useState, useId } from 'react'
import { ChevronRight } from 'lucide-react'

// One item open at a time. Click an open item to close it.
export default function Accordion({ items, defaultOpen = 0, size = 'lg' }) {
  const [open, setOpen] = useState(defaultOpen)
  const uid = useId()
  const titleCls = size === 'lg' ? 'text-lg' : 'text-base'

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.title} className={`border-b border-ink/10 ${isOpen ? 'bg-blush' : ''}`}>
            <h3>
              <button type="button" aria-expanded={isOpen} aria-controls={`${uid}-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-4 py-5 text-left">
                <span className={`${titleCls} font-bold`}>{item.title}</span>
                <ChevronRight size={18} className={`shrink-0 text-brand transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </button>
            </h3>
            <div id={`${uid}-${i}`} role="region"
              className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <p className="px-4 pb-5 text-ink/80">{item.text}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
