import { Check } from 'lucide-react'

// Reached steps (including the current one) are orange with a tick, as in the design.
export default function Stepper({ steps, current }) {
  return (
    <ol className="flex items-center gap-2 text-sm sm:gap-3 sm:text-base" aria-label="Sign up progress">
      {steps.map((label, i) => {
        const reached = i <= current
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-3" aria-current={i === current ? 'step' : undefined}>
            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${reached ? 'border-brand bg-brand text-white' : 'border-ink/40'}`}>
              {reached && <Check size={14} strokeWidth={3} />}
            </span>
            <span className={reached ? 'text-brand' : 'text-ink/80'}>{label}</span>
            {i < steps.length - 1 && <span className={`hidden h-px w-6 sm:block md:w-10 ${i < current ? 'bg-brand' : 'bg-ink/20'}`} />}
          </li>
        )
      })}
    </ol>
  )
}
