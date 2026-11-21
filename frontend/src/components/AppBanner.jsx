// Promo banner. Update copy and store links once your mobile app exists.
export default function AppBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#080404] px-8 py-10 text-white md:px-12 md:py-12">
      <h2 className="text-4xl font-bold leading-tight md:text-5xl">
        Never miss an event.<br /><span className="text-brand">Get the app</span>
      </h2>
      <div className="mt-8 flex flex-wrap gap-4">
        <a href="#" className="rounded-lg border border-white/60 px-5 py-3 text-sm hover:bg-white/10">
          <span className="block text-[10px] uppercase">Get it on</span>
          <span className="text-lg font-medium">Google Play</span>
        </a>
        <a href="#" className="rounded-lg border border-white/60 px-5 py-3 text-sm hover:bg-white/10">
          <span className="block text-[10px]">Download on the</span>
          <span className="text-lg font-medium">App Store</span>
        </a>
      </div>

      {/* Decorative art: swap for a real phone mockup image later */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 md:block">
        <div className="absolute inset-0 rounded-full border border-brand/60" />
        <div className="absolute inset-12 rounded-full border border-brand/40" />
        <div className="absolute left-24 top-20 h-56 w-28 -rotate-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
        <div className="absolute left-44 top-12 h-60 w-28 rotate-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500" />
      </div>
    </section>
  )
}
