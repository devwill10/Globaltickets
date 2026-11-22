import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ThumbsUp, Info, Globe, RotateCcw, X } from 'lucide-react'
import WizardShell from '../../components/dashboard/WizardShell'
import MediaUploader from '../../components/dashboard/MediaUploader'
import EventPagePreview from '../../components/dashboard/EventPagePreview'
import { THEMES, THEME_COLORS, DEFAULT_COLOR } from '../../data/eventOptions'
import { getMyEvent, updateEvent, uploadMedia } from '../../services/myEvents'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../components/Toast'

function Thumb({ id }) {
  const banner = { mist: 'bg-gradient-to-r from-sky-200 to-teal-200', split: 'bg-brand', default: '', heritage: 'bg-blue-50' }[id]
  return (
    <div className={`overflow-hidden rounded-md bg-gray-50 p-2 ${id === 'heritage' ? 'bg-blue-50' : ''}`}>
      <div className={`flex gap-2 rounded p-2 ${banner}`}>
        <div className="h-16 w-12 rounded bg-gradient-to-br from-amber-300 via-teal-400 to-blue-500" />
        <div className="flex-1 space-y-1.5 pt-1">
          <div className="h-2 w-3/4 rounded bg-gray-300/80" /><div className="h-2 w-1/2 rounded bg-gray-300/60" />
          <div className={`h-4 w-14 rounded ${id === 'split' ? 'bg-white' : id === 'heritage' ? 'bg-sky-500' : 'bg-brand'}`} />
        </div>
      </div>
    </div>
  )
}

function Modal({ children, onClose, label }) {
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [])
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label} className="max-h-[calc(100vh-2rem)] supports-[height:100dvh]:max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-auto rounded-2xl bg-white p-8 outline-none">{children}</div>
    </div>
  )
}

export default function EventAppearanceStep() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const [event, setEvent] = useState(null)
  const [media, setMedia] = useState([])
  const [theme, setTheme] = useState('default')
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [missing, setMissing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [safety, setSafety] = useState(Boolean(location.state?.justCreated))
  const [preview, setPreview] = useState(false)

  useEffect(() => { if (location.state?.justCreated) toast('Event created') }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let off = false
    getMyEvent(id, user.id).then((r) => {
      if (off) return
      if (!r) return setMissing(true)
      setEvent(r); setMedia(r.media ?? []); setTheme(r.theme); setColor(r.theme_color ?? DEFAULT_COLOR)
    }).catch((e) => !off && toast(e.message, 'error'))
    return () => { off = true }
  }, [id, user.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    setSaving(true)
    try {
      await updateEvent(id, { media, image_url: media.find((m) => m.type === 'image')?.url ?? null, theme, theme_color: color })
      navigate(`/dashboard/events/${id}/tickets`)
    } catch (e) { toast(e.message, 'error') } finally { setSaving(false) }
  }

  if (missing) return <p className="mt-10">We couldn't find that event.</p>
  const previewEvent = event && {
    title: event.title, startsAt: event.starts_at, endsAt: event.ends_at, timezone: event.timezone,
    address: event.venue, description: event.description, image: media.find((m) => m.type === 'image')?.url,
  }

  return (
    <WizardShell step={1} backTo={`/dashboard/events/${id}/details`}>
      {!event ? <p className="mt-10 text-ink/60" role="status">Loading…</p> : (
        <div className="pb-24">
          <h1 className="mt-10 text-2xl font-bold">Event Image and Media</h1>
          <p className="mt-1 text-sm text-ink/70">You can upload 1 video and up to 4 images.</p>
          <p className="mt-4 flex gap-3 rounded-lg bg-blush p-4 text-sm text-brand">
            <Info size={18} className="mt-0.5 shrink-0" />
            <span>For the best look on video ensure your video is in <b>MP4</b> format with the <b>16:9</b> dimension, and <b>not more than 45 seconds</b>. For images, use a <b>portrait (4:5)</b> or square image. Ensure the <b>JPEG/PNG</b> formats.</span>
          </p>
          <div className="mt-6">
            <MediaUploader media={media} onChange={setMedia} upload={(f) => uploadMedia(user.id, id, f)} />
            <p className="mt-3 flex justify-between text-xs text-ink/70"><span>The maximum file size is 30MB for video and 5MB for images</span><span>The first image is your cover</span></p>
          </div>

          <h2 className="mt-12 text-lg font-bold">Event Page Theme</h2>
          <p className="mt-1 text-sm text-ink/70">Select the layout for your event page. It will only take 2 minutes.</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div>
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Event page theme">
                {THEMES.map((t) => (
                  <button key={t.id} type="button" role="radio" aria-checked={theme === t.id} onClick={() => setTheme(t.id)}
                    className={`rounded-lg border p-3 text-left ${theme === t.id ? 'border-brand ring-1 ring-brand' : 'border-ink/15 hover:border-ink/40'}`}>
                    <span className="mb-2 block text-sm font-bold">{t.label}</span><Thumb id={t.id} />
                  </button>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between text-sm"><span>Color</span>
                <button type="button" onClick={() => { setColor(DEFAULT_COLOR); setTheme('default') }} className="flex items-center gap-1 text-brand"><RotateCcw size={14} />reset</button></div>
              <p className="mt-1 text-sm text-ink/70">Pick a color for your theme</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {THEME_COLORS.map((c) => (
                  <button key={c} type="button" aria-label={`Color ${c}`} aria-pressed={color === c} onClick={() => setColor(c)}
                    className={`h-8 w-9 rounded-lg ${color === c ? 'ring-2 ring-offset-2 ring-ink' : ''}`} style={{ backgroundColor: c }} />
                ))}
              </div>
              <p className="mt-3 text-sm">Selected: <span className="font-mono text-xs">{color}</span></p>
            </div>
            <EventPagePreview event={previewEvent} theme={theme} color={color} />
          </div>

          <div className="mt-12 flex justify-center gap-4">
            <button type="button" onClick={() => navigate(`/dashboard/events/${id}/tickets`)} className="rounded-lg bg-[#fdece8] px-8 py-3 text-sm text-brand hover:bg-[#fbdcd3]">Do it later</button>
            <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-brand px-8 py-3 text-sm text-white hover:bg-brand-dark disabled:opacity-60">{saving ? 'Saving…' : 'Save and Continue'}</button>
          </div>
          <button type="button" onClick={() => setPreview(true)} className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-gray-100 px-5 py-3 text-sm shadow hover:bg-gray-200"><Globe size={16} />Preview page</button>
        </div>
      )}

      {safety && (
        <Modal label="Keep TicketsGlobal safe and respectful" onClose={() => setSafety(false)}>
          <div className="text-center">
            <ThumbsUp size={56} className="mx-auto fill-brand text-brand" />
            <h2 className="mt-4 text-xl font-bold">Keep TicketsGlobal safe and respectful</h2>
            <p className="mt-4 text-sm text-ink/80">Please don't upload nudity, sexually explicit content, graphic violence or gore, hate speech, or harmful/illegal content. Violations may result in your event being flagged or removed, or further action being taken on your account.</p>
            <button type="button" onClick={() => setSafety(false)} className="mt-6 w-full rounded-lg bg-brand py-3 text-sm text-white hover:bg-brand-dark">I understand</button>
          </div>
        </Modal>
      )}
      {preview && previewEvent && (
        <Modal label="Event page preview" onClose={() => setPreview(false)}>
          <button type="button" aria-label="Close preview" onClick={() => setPreview(false)} className="float-right mb-2"><X size={20} /></button>
          <EventPagePreview event={previewEvent} theme={theme} color={color} />
        </Modal>
      )}
    </WizardShell>
  )
}
