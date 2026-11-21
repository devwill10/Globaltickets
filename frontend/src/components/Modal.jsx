import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ title, onClose, children, footer, width = 'max-w-lg', align = 'center' }) {
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className={`flex max-h-[92vh] w-full ${width} flex-col rounded-2xl bg-white outline-none`}>
        <div className={`relative border-b border-ink/10 px-6 py-5 ${align === 'left' ? 'text-left' : 'text-center'}`}>
          <h2 className="font-bold">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="absolute right-5 top-1/2 -translate-y-1/2"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto px-6 py-6">{children}</div>
        {footer && <div className="border-t border-ink/10 px-6 py-5">{footer}</div>}
      </div>
    </div>
  )
}
