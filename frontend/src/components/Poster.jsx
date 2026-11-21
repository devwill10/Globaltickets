// Shows the event image, or a coloured placeholder until real images exist.
export default function Poster({ event, className = '' }) {
  if (event.image) {
    return <img src={event.image} alt={event.title} className={`object-cover ${className}`} />
  }
  return (
    <div
      aria-hidden="true"
      className={`grid place-items-center overflow-hidden p-3 text-center ${className}`}
      style={{ background: `linear-gradient(145deg, hsl(${event.hue} 70% 50%), hsl(${(event.hue + 40) % 360} 60% 22%))` }}
    >
      <span className="line-clamp-3 text-sm font-bold text-white/30">{event.title}</span>
    </div>
  )
}
