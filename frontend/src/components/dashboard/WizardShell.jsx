import { Link } from 'react-router-dom'
import { Check, ChevronLeft } from 'lucide-react'

const STEPS = ['Details', 'Appearance', 'Tickets']

// step: 0 | 1 | 2. Reached steps (including the current one) are orange with a tick.
export default function WizardShell({ step, backTo, children }) {
  return (
    <div className="mx-auto max-w-5xl">
      <Link to={backTo} className="inline-flex items-center gap-1 text-sm hover:text-brand"><ChevronLeft size={16} /> Back</Link>
      <ol className="mt-8 flex items-center gap-3 text-sm font-medium" aria-label="Event setup progress">
        {STEPS.map((label, i) => {
          const reached = i <= step
          return (
            <li key={label} className={`flex items-center gap-2 ${i < STEPS.length - 1 ? 'flex-1' : ''}`} aria-current={i === step ? 'step' : undefined}>
              <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${reached ? 'border-brand bg-brand text-white' : 'border-ink/40'}`}>
                {reached && <Check size={10} strokeWidth={4} />}
              </span>
              <span className={reached ? 'text-brand' : 'text-ink/80'}>{label}</span>
              {i < STEPS.length - 1 && <span className={`h-px flex-1 ${i < step ? 'bg-brand' : 'bg-ink/15'}`} />}
            </li>
          )
        })}
      </ol>
      {children}
    </div>
  )
}
