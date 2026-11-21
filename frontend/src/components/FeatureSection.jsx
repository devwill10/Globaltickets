import Accordion from './Accordion'
import FeaturePanel from './FeaturePanel'

export default function FeatureSection({ section }) {
  return (
    <section className="mx-auto grid max-w-4xl items-start gap-8 px-5 py-12 md:grid-cols-[1fr_1fr] md:gap-12">
      <div className="md:sticky md:top-8"><FeaturePanel panel={section.panel} /></div>
      <div>
        <span className="inline-block rounded-full bg-gray-100 px-4 py-2 text-sm font-bold">{section.label}</span>
        <div className="mt-6"><Accordion items={section.items} /></div>
      </div>
    </section>
  )
}
