import { Mail } from 'lucide-react'

// Simple phone + envelope illustration. Swap for your own artwork later.
export default function MailPhoneArt() {
  return (
    <div className="relative h-64 w-44 shrink-0" aria-hidden="true">
      <div className="absolute bottom-0 left-0 h-60 w-32 rounded-2xl border-4 border-ink bg-white p-2">
        <div className="mx-auto mt-1 h-2 w-12 rounded-full bg-ink" />
        <div className="mt-3 space-y-2"><div className="h-12 rounded-lg bg-gray-200" /><div className="h-20 rounded-lg bg-gray-200" /><div className="h-12 rounded-lg bg-gray-200" /></div>
      </div>
      <div className="absolute right-0 top-0 grid h-16 w-16 place-items-center rounded-full bg-ink text-white"><Mail size={24} /></div>
    </div>
  )
}
