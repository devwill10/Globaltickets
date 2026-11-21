// Left-hand visual. Swap for a real screenshot by passing `image`.
export default function FeaturePanel({ panel }) {
  return (
    <div className="rounded-3xl bg-blush p-6 sm:p-10">
      {panel.image ? (
        <img src={panel.image} alt={panel.title} className="w-full rounded-xl" />
      ) : panel.type === 'photo' ? (
        <div className="grid aspect-[4/3] place-items-center rounded-xl text-sm font-medium text-white/80"
          style={{ background: `linear-gradient(135deg, hsl(${panel.hue} 85% 55%), hsl(${panel.hue + 40} 70% 35%))` }}>
          {panel.title}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-1.5 bg-orange-100 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-red-400" /><span className="h-2 w-2 rounded-full bg-yellow-400" /><span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="mx-auto rounded bg-white/70 px-10 py-0.5 text-[9px] text-ink/50">ticketsglobal</span>
          </div>
          <div className="space-y-3 p-5">
            <p className="text-sm font-bold">{panel.title}</p>
            <div className="h-3 w-2/3 rounded bg-gray-100" />
            <div className="h-24 rounded bg-gray-100" />
            <div className="h-3 w-1/2 rounded bg-gray-100" />
            <div className="h-8 w-24 rounded bg-brand" />
          </div>
        </div>
      )}
    </div>
  )
}
