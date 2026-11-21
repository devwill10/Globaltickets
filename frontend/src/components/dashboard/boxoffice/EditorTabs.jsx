import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import RichTextEditor from '../RichTextEditor'
import { Label, ErrorText, SelectBox, inputCls } from '../FormBits'
import BoxOfficeView from '../../boxoffice/BoxOfficeView'
import { BOX_THEMES, FONTS, FONT_FIELDS, COLOR_FIELDS, isHex } from '../../../data/boxOffice'
import { uploadMedia } from '../../../services/myEvents'
import { formatEventDate } from '../../../utils/format'

function ImageField({ userId, value, onChange, label = 'Image' }) {
  const ref = useRef(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  async function pick(e) {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    if (!['image/jpeg', 'image/png'].includes(f.type)) return setErr('Use a JPEG or PNG image.')
    if (f.size > 5 * 1024 * 1024) return setErr('Images can be up to 5MB.')
    setErr(''); setBusy(true)
    try { onChange((await uploadMedia(userId, 'box-offices', f)).url) } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }
  return (
    <div>
      <button type="button" aria-label={value ? `Change ${label}` : `Upload ${label}`} onClick={() => ref.current?.click()}
        className="group relative grid h-44 w-44 place-items-center overflow-hidden rounded-xl bg-gray-100 text-sm text-brand hover:bg-gray-200">
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <span>{busy ? 'Uploading…' : 'Click to upload'}</span>}
        {value && <span className="absolute inset-0 grid place-items-center bg-black/0 group-hover:bg-black/30"><span className="rounded border border-white px-3 py-1.5 text-xs text-white opacity-0 group-hover:opacity-100">{busy ? 'Uploading…' : 'Change Image'}</span></span>}
      </button>
      <input ref={ref} type="file" accept="image/jpeg,image/png" className="hidden" onChange={pick} />
      {err && <p role="alert" className="mt-2 text-xs text-red-600">{err}</p>}
    </div>
  )
}

export function DetailsTab({ v, set, setSocial, errors, userId }) {
  const textLen = v.description.replace(/<[^>]*>/g, '').length
  const bad = (k) => ({ id: `bo-${k}`, 'aria-invalid': Boolean(errors[k]), 'aria-describedby': errors[k] ? `boe-${k}` : undefined })
  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-lg font-bold">Details</h2>
      <div>
        <div className="flex justify-between"><Label htmlFor="bo-title" required>Box office title</Label><span className="text-xs text-ink/60">{v.title.length}/75</span></div>
        <input {...bad('title')} value={v.title} maxLength={75} onChange={(e) => set('title', e.target.value)} className={inputCls(errors.title)} />
        <ErrorText id="boe-title">{errors.title}</ErrorText>
      </div>
      <div>
        <Label htmlFor="bo-description" required>Describe your box office</Label>
        <RichTextEditor id="bo-description" value={v.description} onChange={(h) => set('description', h)} error={errors.description} />
        <p className={`mt-1 text-right text-xs ${textLen > 2000 ? 'text-red-600' : 'text-ink/60'}`}>{textLen}/2000</p>
        <ErrorText id="boe-description">{errors.description}</ErrorText>
      </div>
      <div>
        <Label htmlFor="bo-slug">Use custom URL</Label>
        <div className={`flex overflow-hidden rounded-lg border ${errors.slug ? 'border-red-500' : 'border-ink/20'}`}>
          <span className="whitespace-nowrap border-r border-ink/20 bg-gray-50 px-4 py-3 text-sm">{window.location.host}/discover/bo/</span>
          <input {...bad('slug')} value={v.slug} maxLength={60} placeholder="my-box-office" className="min-w-0 flex-1 px-4 py-3 text-sm outline-none"
            onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} />
        </div>
        <ErrorText id="boe-slug">{errors.slug}</ErrorText>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-bold">Box office Image</h3>
        <ImageField userId={userId} value={v.image_url} onChange={(u) => set('image_url', u)} label="box office image" />
        <p className="mt-3 rounded-lg bg-blush px-4 py-3 text-xs text-brand">Upload a JPEG or PNG file. Images with a 1:1 ratio (a square) work best on all themes.</p>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-bold">Social Details</h3>
        <div className="space-y-3">
          {[['website', 'https://yourwebsite.url/'], ['instagram', 'Your Instagram Handle'], ['x', 'Your X(Twitter) Handle'], ['facebook', 'Your Facebook URL']].map(([k, ph]) => (
            <div key={k}><input {...bad(k)} aria-label={ph} value={v.social[k]} onChange={(e) => setSocial(k, e.target.value)} placeholder={ph} maxLength={200} className={inputCls(errors[k])} /><ErrorText id={`boe-${k}`}>{errors[k]}</ErrorText></div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ThemeMock({ id }) {
  const img = <div className="aspect-square w-full rounded bg-gradient-to-br from-orange-400 via-yellow-300 to-green-500" />
  const lines = <div className="space-y-1.5"><div className="h-2 w-3/4 rounded bg-gray-400" /><div className="h-1.5 w-full rounded bg-gray-300" /><div className="h-1.5 w-5/6 rounded bg-gray-300" /></div>
  if (id === 'boxie') return <div className="grid grid-cols-2 items-center gap-3 p-3">{lines}<div className="rounded bg-yellow-50 p-1">{img}</div></div>
  if (id === 'edge') return <div className="grid grid-cols-2 items-center gap-3 p-3">{img}{lines}</div>
  if (id === 'night') return <div className="m-3 grid grid-cols-2 items-center gap-3 rounded bg-black p-3"><div className="space-y-1.5"><div className="h-2 w-3/4 rounded bg-white" /><div className="h-1.5 w-full rounded bg-gray-500" /></div>{img}</div>
  return <div className="p-3"><div className="rounded bg-yellow-50 p-3"><div className="mx-auto w-1/2">{img}</div></div><div className="mx-auto mt-2 w-2/3">{lines}</div></div>
}

export function DesignTab({ v, set, previewBox, previewEvents }) {
  return (
    <div>
      <h2 className="text-lg font-bold">Box Office Theme</h2>
      <p className="text-sm text-ink/70">Choose a design for your box office</p>
      <div role="radiogroup" aria-label="Box office theme" className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {BOX_THEMES.map((t) => (
          <button key={t.id} type="button" role="radio" aria-checked={v.theme === t.id} onClick={() => set('theme', t.id)}
            className={`rounded-xl border bg-gray-50 p-3 text-left ${v.theme === t.id ? 'border-brand ring-1 ring-brand' : 'border-ink/15 hover:border-ink/40'}`}>
            <span className="mb-2 block text-xs font-bold">{t.label}</span><div className="rounded bg-white"><ThemeMock id={t.id} /></div>
          </button>
        ))}
      </div>
      <h3 className="mt-8 text-sm font-bold">Preview</h3>
      <div className="mt-3 overflow-hidden rounded-xl border border-ink/10"><BoxOfficeView box={previewBox} events={previewEvents} theme={v.theme} settings={v.settings} /></div>
    </div>
  )
}

const ago = (iso) => {
  const d = Math.round((Date.now() - new Date(iso)) / 864e5)
  if (d < 0) return `Starts ${formatEventDate(iso)}`
  if (d === 0) return 'Ended today'
  return d < 60 ? `Ended ${d} day${d === 1 ? '' : 's'} ago` : d < 730 ? `Ended ${Math.round(d / 30)} months ago` : `Ended ${Math.round(d / 365)} years ago`
}

export function EventsTab({ events, selected, busy, onToggle }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="text-lg font-bold">Box Office Events</h2><p className="text-sm text-ink/70">Choose from your published events.</p></div>
        <Link to="/dashboard/events/new" className="inline-flex items-center gap-2 rounded-lg border border-ink/15 px-4 py-2.5 text-sm hover:border-brand"><Plus size={14} />Create event</Link>
      </div>
      {events === null ? <div className="mt-6 h-24 animate-pulse rounded-xl bg-gray-100" aria-busy="true" />
      : events.length === 0 ? <p className="mt-6 rounded-xl bg-gray-50 py-12 text-center text-sm text-ink/60">You have no published events yet. Publish an event, then add it here.</p>
      : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {events.map((e) => {
            const on = selected.has(e.id)
            return (
              <li key={e.id}>
                <label className={`flex cursor-pointer items-stretch gap-4 rounded-xl border p-3 focus-within:ring-2 focus-within:ring-brand/40 ${on ? 'border-brand bg-blush' : 'border-ink/10 hover:border-ink/30'}`}>
                  <input type="checkbox" checked={on} disabled={busy === e.id} onChange={() => onToggle(e.id, !on)} className="sr-only" />
                  {e.image ? <img src={e.image} alt="" className="h-20 w-16 rounded-md object-cover" /> : <div className="h-20 w-16 rounded-md bg-gradient-to-br from-orange-200 to-orange-400" />}
                  <div className="min-w-0 flex-1 text-sm"><p className="truncate font-bold">{e.title}</p><p className="mt-1 text-xs text-ink/60">{ago(e.ends_at ?? e.starts_at)}</p>
                    <p className="mt-3 text-xs text-ink/70"><b>{e.sold}</b> Tickets sold</p></div>
                  <span aria-hidden="true" className={`mt-1 h-5 w-5 shrink-0 rounded-full border-2 ${on ? 'border-brand bg-brand shadow-[inset_0_0_0_3px_white]' : 'border-ink/25'}`} />
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function Accordion({ title, open, onToggle, children }) {
  return (
    <div className="border-b border-ink/10">
      <button type="button" aria-expanded={open} onClick={onToggle} className="flex w-full items-center justify-between py-5 text-left text-sm font-bold">{title}{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>
      {open && <div className="space-y-4 pb-6">{children}</div>}
    </div>
  )
}

export function AdvancedTab({ v, setSettings, userId, previewBox, previewEvents }) {
  const [open, setOpen] = useState('logo')
  const toggle = (k) => setOpen(open === k ? null : k)
  const setFont = (k, val) => setSettings((s) => ({ ...s, fonts: { ...s.fonts, [k]: val } }))
  const setColor = (k, val) => setSettings((s) => ({ ...s, colors: { ...s.colors, [k]: val } }))
  const font = (k) => (
    <div key={k}><Label htmlFor={`bf-${k}`}>{FONT_FIELDS[k]}</Label>
      <SelectBox id={`bf-${k}`} value={v.settings.fonts[k] ?? ''} onChange={(x) => setFont(k, x)} options={FONTS} placeholder="None selected" /></div>
  )
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <h2 className="text-lg font-bold">Advanced Theme Settings</h2>
        <p className="text-sm text-ink/70">Customise elements of your chosen theme.</p>
        <div className="mt-6 border-t border-ink/10">
          <Accordion title="Logo & Header Section Styles" open={open === 'logo'} onToggle={() => toggle('logo')}>
            <div><p className="mb-2 text-xs">Upload a Logo image (Optional)</p>
              <ImageField userId={userId} value={v.settings.logo_url} onChange={(u) => setSettings((s) => ({ ...s, logo_url: u }))} label="logo" />
              {v.settings.logo_url && <button type="button" onClick={() => setSettings((s) => ({ ...s, logo_url: '' }))} className="mt-2 text-xs text-brand underline">Remove logo</button>}</div>
            <p className="text-sm font-bold">Font</p>{font('header')}
          </Accordion>
          <Accordion title="Body Section Styles" open={open === 'body'} onToggle={() => toggle('body')}>
            <p className="text-sm font-bold">Fonts</p>{font('body')}{font('links')}
            <p className="text-sm font-bold">Colour Set</p>
            {Object.entries(COLOR_FIELDS).map(([k, label]) => {
              const val = v.settings.colors[k] ?? ''
              return (
                <div key={k} className="flex items-center justify-between gap-4 text-xs">
                  <label htmlFor={`bc-${k}`}>{label}</label>
                  <div className={`flex items-center overflow-hidden rounded-lg border ${isHex(val) ? 'border-ink/20' : 'border-red-500'}`}>
                    <input id={`bc-${k}`} value={val} maxLength={7} onChange={(e) => setColor(k, e.target.value)} aria-invalid={!isHex(val)} className="w-24 px-3 py-2 outline-none" />
                    <input type="color" aria-label={`${label} colour picker`} value={isHex(val) ? val : '#000000'} onChange={(e) => setColor(k, e.target.value)} className="h-9 w-10 cursor-pointer border-0 bg-transparent p-1" />
                  </div>
                </div>
              )
            })}
          </Accordion>
          <Accordion title="Event Section Styles" open={open === 'event'} onToggle={() => toggle('event')}>
            <p className="text-sm font-bold">Fonts</p>{['sectionTitle', 'sectionLink', 'eventTitle', 'eventDetails', 'eventPrice'].map(font)}
          </Accordion>
        </div>
      </div>
      <aside className="hidden lg:block"><div className="sticky top-6 max-h-[85vh] overflow-auto rounded-xl border border-ink/10"><BoxOfficeView compact box={previewBox} events={previewEvents} theme={v.theme} settings={v.settings} /></div></aside>
    </div>
  )
}
