import { ChevronDown } from 'lucide-react'

export const inputCls = (err) =>
  `w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-gray-100 disabled:text-ink/50 ${err ? 'border-red-500' : 'border-ink/20'}`

export const Label = ({ htmlFor, required, children }) => (
  <label htmlFor={htmlFor} className="mb-1.5 block text-xs text-ink/80">
    {required && <span className="mr-1 text-brand">*</span>}{children}
  </label>
)

export const ErrorText = ({ id, children }) =>
  children ? <p id={id} role="alert" className="mt-1 text-xs text-red-600">{children}</p> : null

export function SelectBox({ id, value, onChange, options, placeholder = 'Select', error, disabled }) {
  return (
    <div className="relative">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        aria-invalid={Boolean(error)} className={`${inputCls(error)} appearance-none pr-10 ${value ? '' : 'text-ink/50'}`}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o
          return <option key={opt.value} value={opt.value}>{opt.label}</option>
        })}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
    </div>
  )
}

export const Section = ({ title, hint, children }) => (
  <section className="mt-12">
    <h2 className="text-lg font-bold">{title}</h2>
    {hint && <p className="mt-1 text-sm text-ink/70">{hint}</p>}
    <div className="mt-4 space-y-5">{children}</div>
  </section>
)
