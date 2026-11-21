import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { DetailsTab, DesignTab, EventsTab, AdvancedTab } from '../../components/dashboard/boxoffice/EditorTabs'
import { SAMPLE_EVENTS } from '../../components/boxoffice/BoxOfficeView'
import { DEFAULT_COLORS, FONTS, isHex } from '../../data/boxOffice'
import { createBoxOffice, getBoxOffice, updateBoxOffice, deleteBoxOffice, getBoxOfficeEventIds, addBoxOfficeEvent, removeBoxOfficeEvent, listMyPublishedEvents } from '../../services/boxOffice'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../components/Toast'
import { safeHttpUrl } from '../../utils/safeUrl'

const blank = {
  title: '', description: '', slug: '', image_url: '', theme: 'default',
  social: { website: '', instagram: '', x: '', facebook: '' },
  settings: { logo_url: '', fonts: {}, colors: { ...DEFAULT_COLORS } },
}
const TABS = [['details', 'Details'], ['design', 'Design settings'], ['events', 'Events'], ['advanced', 'Advanced Settings']]
const handleOk = (s) => /^[A-Za-z0-9._]{1,30}$/.test(s.replace(/^@/, ''))

const fromRow = (r) => ({
  title: r.title, description: r.description ?? '', slug: r.slug ?? '', image_url: r.image_url ?? '', theme: r.theme,
  social: { website: '', instagram: '', x: '', facebook: '', ...(r.social ?? {}) },
  settings: { logo_url: r.settings?.logo_url ?? '', fonts: { ...(r.settings?.fonts ?? {}) }, colors: { ...DEFAULT_COLORS, ...(r.settings?.colors ?? {}) } },
})

function toRow(v) {
  const social = Object.fromEntries(Object.entries(v.social).map(([k, x]) => [k, k === 'instagram' || k === 'x' ? x.trim().replace(/^@/, '') : x.trim()]).filter(([, x]) => x))
  const fonts = Object.fromEntries(Object.entries(v.settings.fonts).filter(([, f]) => FONTS.includes(f)))
  return {
    title: v.title.trim(), description: v.description, slug: v.slug.trim() || null, image_url: v.image_url || null,
    social, theme: v.theme, settings: { logo_url: v.settings.logo_url || '', fonts, colors: v.settings.colors },
  }
}

function validate(v) {
  const e = {}
  const text = v.description.replace(/<[^>]*>/g, '').trim()
  if (v.title.trim().length < 3) e.title = 'Enter a title of at least 3 characters.'
  if (!text) e.description = 'Describe your box office.'
  else if (text.length > 2000) e.description = 'Keep the description under 2000 characters.'
  if (v.slug && (v.slug.length < 3 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v.slug))) e.slug = 'Use 3 to 60 lowercase letters, numbers and single hyphens.'
  const { website, facebook, instagram, x } = v.social
  if (website && !safeHttpUrl(website)) e.website = 'Enter a full link starting with https://'
  if (facebook && !safeHttpUrl(facebook)) e.facebook = 'Enter a full link starting with https://'
  if (instagram && !handleOk(instagram)) e.instagram = 'Enter a valid handle.'
  if (x && !handleOk(x)) e.x = 'Enter a valid handle.'
  if (Object.values(v.settings.colors).some((c) => !isHex(c))) e.colors = 'Colours must look like #A1B2C3.'
  return e
}

export default function BoxOfficeEditor() {
  const { id } = useParams()
  const isNew = !id
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [saved, setSaved] = useState(isNew ? blank : null)
  const [draft, setDraft] = useState(blank)
  const [status, setStatus] = useState('draft')
  const [tab, setTab] = useState('details')
  const [errors, setErrors] = useState({})
  const [missing, setMissing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [events, setEvents] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [busyEvent, setBusyEvent] = useState(null)

  useEffect(() => { if (location.state?.created) toast('Box office created') }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isNew) return
    let off = false
    ;(async () => {
      try {
        const [row, evs, ids] = await Promise.all([getBoxOffice(id, user.id), listMyPublishedEvents(user.id), getBoxOfficeEventIds(id)])
        if (off) return
        if (!row) return setMissing(true)
        const f = fromRow(row)
        setSaved(f); setDraft(f); setStatus(row.status); setEvents(evs); setSelected(new Set(ids))
      } catch (e) { if (!off) toast(e.message, 'error') }
    })()
    return () => { off = true }
  }, [id, user.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = useCallback((k, val) => { setDraft((d) => ({ ...d, [k]: val })); setErrors((e) => ({ ...e, [k]: undefined })) }, [])
  const setSocial = useCallback((k, val) => { setDraft((d) => ({ ...d, social: { ...d.social, [k]: val } })); setErrors((e) => ({ ...e, [k]: undefined })) }, [])
  const setSettings = useCallback((fn) => { setDraft((d) => ({ ...d, settings: fn(d.settings) })); setErrors((e) => ({ ...e, colors: undefined })) }, [])

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const previewBox = { title: draft.title, description: draft.description, image_url: draft.image_url, social: draft.social }
  const previewEvents = useMemo(() => {
    const mine = (events ?? []).filter((e) => selected.has(e.id)).map((e) => ({ id: e.id, title: e.title, date: e.starts_at, venue: e.venue, price: e.price, currency: e.currency, image: e.image }))
    return mine.length ? mine : SAMPLE_EVENTS
  }, [events, selected])

  async function save() {
    const errs = validate(draft)
    setErrors(errs)
    const key = Object.keys(errs)[0]
    if (key) { setTab(key === 'colors' ? 'advanced' : 'details'); setTimeout(() => document.getElementById(key === 'colors' ? 'bc-body' : `bo-${key}`)?.focus(), 0); return }
    setSaving(true)
    try {
      const row = toRow(draft)
      if (isNew) { const newId = await createBoxOffice(row); navigate(`/dashboard/box-office/${newId}`, { state: { created: true }, replace: true }) }
      else { await updateBoxOffice(id, row); setSaved(draft); toast('Box office saved') }
    } catch (e) {
      toast(e.message, 'error')
      if (/custom URL/i.test(e.message)) { setErrors((x) => ({ ...x, slug: e.message })); setTab('details') }
    } finally { setSaving(false) }
  }

  async function toggleEvent(eventId, on) {
    setBusyEvent(eventId)
    try {
      if (on) await addBoxOfficeEvent(id, eventId); else await removeBoxOfficeEvent(id, eventId)
      setSelected((s) => { const n = new Set(s); if (on) n.add(eventId); else n.delete(eventId); return n })
    } catch (e) { toast(e.message, 'error') } finally { setBusyEvent(null) }
  }

  async function setPublished(publish) {
    if (dirty) return toast('Save your changes first.', 'error')
    try { await updateBoxOffice(id, { status: publish ? 'published' : 'draft' }); setStatus(publish ? 'published' : 'draft'); toast(publish ? 'Box office published' : 'Box office unpublished') }
    catch (e) { toast(e.message, 'error') }
  }

  async function remove() {
    if (!window.confirm('Delete this box office? Your events are not affected.')) return
    try { await deleteBoxOffice(id); toast('Box office deleted'); navigate('/dashboard/box-office') } catch (e) { toast(e.message, 'error') }
  }

  if (missing) return <p className="mt-10">We couldn't find that box office. <Link to="/dashboard/box-office" className="text-brand underline">Back to box offices</Link></p>
  if (!isNew && saved === null) return <p className="mt-10 text-ink/60" role="status">Loading…</p>
  const publicPath = `/discover/bo/${saved?.slug || id}`

  return (
    <div className="max-w-6xl pb-16">
      <Link to="/dashboard/box-office" className="inline-flex items-center gap-1 text-sm hover:text-brand"><ChevronLeft size={16} />Back</Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-2xl font-bold">{draft.title || 'New box office'}</h1><p className="text-xs text-ink/60">A Box Office is a collection of events</p></div>
        {!isNew && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className={`rounded-full px-3 py-1 text-xs capitalize ${status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{status}</span>
            {status === 'published' && <Link to={publicPath} target="_blank" className="text-brand underline">View page</Link>}
            {status === 'published'
              ? <button type="button" onClick={() => setPublished(false)} className="rounded-lg border border-ink/20 px-4 py-2 hover:border-brand">Unpublish</button>
              : <button type="button" onClick={() => setPublished(true)} className="rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-dark">Publish</button>}
            <button type="button" onClick={remove} className="rounded-lg px-3 py-2 text-red-600 hover:bg-red-50">Delete</button>
          </div>
        )}
      </div>

      <div role="tablist" aria-label="Box office settings" className="mt-6 flex gap-6 overflow-x-auto border-b border-ink/10 sm:gap-8">
        {TABS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} disabled={isNew && k !== 'details'} title={isNew && k !== 'details' ? 'Save the details first' : undefined} onClick={() => setTab(k)}
            className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${tab === k ? 'border-brand font-medium text-brand' : 'border-transparent'}`}>{label}</button>
        ))}
      </div>

      <div role="tabpanel" className="mt-8">
        {tab === 'details' && <DetailsTab v={draft} set={set} setSocial={setSocial} errors={errors} userId={user.id} />}
        {tab === 'design' && <DesignTab v={draft} set={set} previewBox={previewBox} previewEvents={previewEvents} />}
        {tab === 'events' && <EventsTab events={events} selected={selected} busy={busyEvent} onToggle={toggleEvent} />}
        {tab === 'advanced' && <AdvancedTab v={draft} setSettings={setSettings} userId={user.id} previewBox={previewBox} previewEvents={previewEvents} />}
        {errors.colors && tab === 'advanced' && <p role="alert" className="mt-4 text-sm text-red-600">{errors.colors}</p>}
      </div>

      {tab !== 'events' && (
        <div className="mt-10 flex justify-center gap-4">
          <button type="button" onClick={() => (isNew ? navigate('/dashboard/box-office') : (setDraft(saved), setErrors({})))} className="rounded-lg bg-[#fdece8] px-10 py-3 text-sm text-brand hover:bg-[#fbdcd3]">Cancel</button>
          <button type="button" onClick={save} disabled={saving || (!isNew && !dirty)} className="rounded-lg bg-brand px-10 py-3 text-sm text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      )}
    </div>
  )
}
