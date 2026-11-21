import { useEffect, useRef, useState } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'

// variant: 'pill' (filters) | 'plain' (large country picker) | 'inline' (small, centred). `active` fills a pill in black.
export default function FilterDropdown({ options, value, onChange, variant = 'pill', active = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = options.find((o) => o.value === value) ?? options[0]

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const button = variant === 'plain'
    ? 'flex items-center gap-2 text-2xl font-bold'
    : variant === 'inline'
    ? 'flex items-center gap-3 text-base'
    : `flex items-center gap-3 rounded-lg border px-5 py-3 text-sm ${active ? 'border-ink bg-ink text-white' : 'border-ink/70 bg-white hover:bg-gray-50'}`

  return (
    <div ref={ref} className="relative">
      <button type="button" className={button} onClick={() => setOpen(!open)} aria-expanded={open}>
        {variant !== 'pill' && <MapPin size={variant === 'plain' ? 24 : 18} className="text-brand" />}
        {current.label}
        <ChevronDown size={16} className={open ? 'rotate-180 transition' : 'transition'} />
      </button>
      {open && (
        <ul className={`absolute top-full z-20 ${variant === 'inline' ? 'left-1/2 -translate-x-1/2' : 'left-0'} mt-2 min-w-44 rounded-lg border border-ink/10 bg-white py-2 text-left shadow-lg`}>
          {options.map((o) => (
            <li key={o.value}>
              <button type="button"
                onClick={() => { onChange(o.value); setOpen(false) }}
                className={`block w-full px-4 py-2 text-left text-sm hover:bg-blush ${o.value === value ? 'font-bold text-brand' : ''}`}>
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
