import { useState } from 'react'
import { Eye, EyeOff, ChevronDown } from 'lucide-react'

// Labelled input / select / password field with inline error text.
export default function Field({
  name, label, value, onChange, error, required, optional,
  type = 'text', options, placeholder, autoComplete, hint,
}) {
  const [show, setShow] = useState(false)
  const id = `field-${name}`
  const base = `w-full rounded-lg border bg-white px-5 py-4 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 ${error ? 'border-red-500' : 'border-ink/20'}`
  const aria = { 'aria-invalid': Boolean(error), 'aria-describedby': error ? `${id}-err` : hint ? `${id}-hint` : undefined }

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm">
        {required && <span className="mr-1 text-brand">*</span>}{label}{optional && ' (Optional)'}
      </label>

      {options ? (
        <div className="relative">
          <select id={id} name={name} value={value} onChange={onChange} required={required} {...aria}
            className={`${base} appearance-none pr-12 ${value ? '' : 'text-ink/50'}`}>
            <option value="">{placeholder}</option>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown size={18} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2" />
        </div>
      ) : type === 'password' ? (
        <div className="relative">
          <input id={id} name={name} type={show ? 'text' : 'password'} value={value} onChange={onChange}
            placeholder={placeholder} autoComplete={autoComplete} {...aria} className={`${base} pr-14`} />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/70 hover:text-ink">
            {show ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
      ) : (
        <input id={id} name={name} type={type} value={value} onChange={onChange}
          placeholder={placeholder} autoComplete={autoComplete} {...aria} className={base} />
      )}

      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink/60">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}
