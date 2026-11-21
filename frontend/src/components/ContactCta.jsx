// Orange call-to-action card with an optional list of services.
export default function ContactCta({ icon, title, text, items = [], href = 'mailto:support@ticketsglobal.com' }) {
  return (
    <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-brand px-6 py-14 text-center text-white">
      <div aria-hidden="true" className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
      <div aria-hidden="true" className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/5" />
      <div className="relative">
        {icon}
        <h2 className="text-4xl font-bold">{title}</h2>
        <p className="mt-4">{text}</p>
        {items.length > 0 && (
          <ul className="mx-auto mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-5 text-sm sm:grid-cols-3">
            {items.map((i) => <li key={i}>{i}</li>)}
          </ul>
        )}
        <a href={href} className="mt-10 inline-block w-full max-w-xs rounded-md bg-white py-4 text-sm text-brand hover:bg-blush">
          Contact Us
        </a>
      </div>
    </div>
  )
}
