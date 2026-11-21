// Placeholder names. Swap for real logo <img> tags when you have partners.
const partners = ['Sporting Lagos', 'Art X Lagos', 'Rhythm & Brunch', 'Afro Future', 'Group Therapy', 'Mullar Soundsystem', 'Global Citizen', 'Eat Drink Festival']

export default function PartnerMarquee() {
  const row = [...partners, ...partners]
  return (
    <div className="overflow-hidden bg-blush pb-20">
      <div className="marquee flex w-max items-center gap-16 text-2xl font-bold text-ink/40">
        {row.map((p, n) => <span key={n} className="whitespace-nowrap">{p}</span>)}
      </div>
    </div>
  )
}
