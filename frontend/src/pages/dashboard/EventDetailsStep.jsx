import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Info } from 'lucide-react'
import WizardShell from '../../components/dashboard/WizardShell'
import { Label, ErrorText, SelectBox, Section, inputCls } from '../../components/dashboard/FormBits'
import RichTextEditor from '../../components/dashboard/RichTextEditor'
import CategoryPicker from '../../components/dashboard/CategoryPicker'
import LineupEditor from '../../components/dashboard/LineupEditor'
import { COUNTRIES } from '../../data/events'
import { FORMATS } from '../../data/eventOptions'
import { TIMEZONES, toIso } from '../../utils/eventTime'
import { createEvent, getMyEvent, updateEvent, uploadMedia, toRow, fromRow } from '../../services/myEvents'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../components/Toast'

const blank = {
  title: '', description: '', country: 'Nigeria', address: '', locationTip: '', slug: '', format: '', tags: [],
  timezone: 'Africa/Lagos', startDate: '', startTime: '', startAmPm: 'AM', endDate: '', endTime: '', endAmPm: 'AM',
  lineupTitle: '', lineup: [], social: { website: '', instagram: '', x: '', facebook: '' },
}
const isUrl = (s) => { try { return /^https?:$/.test(new URL(s).protocol) } catch { return false } }
const handleOk = (s) => /^[A-Za-z0-9._]{1,30}$/.test(s.replace(/^@/, ''))

function validate(v, isNew) {
  const e = {}
  if (!v.title.trim()) e.title = 'Enter an event name.'
  else if (v.title.trim().length < 3) e.title = 'Use at least 3 characters.'
  if (!v.description.replace(/<[^>]*>/g, '').trim()) e.description = 'Describe your event.'
  if (!v.country) e.country = 'Choose a country.'
  if (v.address.trim().length < 3) e.address = 'Enter the event location.'
  if (!v.format) e.format = 'Choose an event format.'
  if (v.tags.length === 0) e.tags = 'Pick at least one category.'
  if (v.slug && (v.slug.length < 3 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v.slug))) e.slug = 'Use 3 to 60 lowercase letters, numbers and single hyphens.'
  const s = toIso(v.startDate, v.startTime, v.startAmPm, v.timezone)
  const en = toIso(v.endDate, v.endTime, v.endAmPm, v.timezone)
  if (!v.startDate) e.startDate = 'Choose a start date.'
  else if (!s) e.startTime = 'Use a time like 05:00.'
  else if (isNew && new Date(s) < new Date()) e.startDate = 'The start must be in the future.'
  if (!v.endDate) e.endDate = 'Choose an end date.'
  else if (!en) e.endTime = 'Use a time like 10:00.'
  else if (s && new Date(en) <= new Date(s)) e.endDate = 'The end must be after the start.'
  const { website, instagram, x, facebook } = v.social
  if (website && !isUrl(website)) e.website = 'Enter a full link starting with https://'
  if (facebook && !isUrl(facebook)) e.facebook = 'Enter a full link starting with https://'
  if (instagram && !handleOk(instagram)) e.instagram = 'Enter a valid handle.'
  if (x && !handleOk(x)) e.x = 'Enter a valid handle.'
  return e
}

export default function EventDetailsStep() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const [values, setValues] = useState(blank)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(Boolean(id))
  const [missing, setMissing] = useState(false)
  const [saving, setSaving] = useState(false)
  const first = (user.name || 'there').split(' ')[0]

  useEffect(() => {
    if (!id) return
    let off = false
    getMyEvent(id, user.id)
      .then((r) => { if (off) return; if (r) setValues(fromRow(r)); else setMissing(true) })
      .catch((e) => !off && toast(e.message, 'error'))
      .finally(() => !off && setLoading(false))
    return () => { off = true }
  }, [id, user.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (val) => { setValues((v) => ({ ...v, [k]: val })); setErrors((er) => ({ ...er, [k]: undefined })) }
  const on = (k) => (e) => set(k)(e.target.value)
  const setSocial = (k) => (e) => { setValues((v) => ({ ...v, social: { ...v.social, [k]: e.target.value } })); setErrors((er) => ({ ...er, [k]: undefined })) }
  const bad = (k) => ({ id: `f-${k}`, 'aria-invalid': Boolean(errors[k]), 'aria-describedby': errors[k] ? `e-${k}` : undefined })

  async function submit(ev) {
    ev.preventDefault()
    const errs = validate(values, !id)
    setErrors(errs)
    const key = Object.keys(errs)[0]
    if (key) { document.getElementById(`f-${key}`)?.focus(); return }
    setSaving(true)
    try {
      const social = { ...values.social, instagram: values.social.instagram.replace(/^@/, ''), x: values.social.x.replace(/^@/, '') }
      const row = toRow({ ...values, social })
      if (id) { await updateEvent(id, row); toast('Details saved'); navigate(`/dashboard/events/${id}/appearance`) }
      else { const newId = await createEvent(row); navigate(`/dashboard/events/${newId}/appearance`, { state: { justCreated: true } }) }
    } catch (e) {
      toast(e.message, 'error')
      if (/custom URL/i.test(e.message)) setErrors((er) => ({ ...er, slug: e.message }))
    } finally { setSaving(false) }
  }

  if (missing) return <p className="mt-10">We couldn't find that event. <button className="text-brand underline" onClick={() => navigate('/dashboard/events')}>Back to events</button></p>

  return (
    <WizardShell step={0} backTo="/dashboard/events">
      {loading ? <p className="mt-10 text-ink/60" role="status">Loading…</p> : (
        <form onSubmit={submit} noValidate className="pb-16">
          <h1 className="mt-10 text-3xl font-bold">Hi {first},</h1>
          <p className="mt-1 text-sm text-ink/70">Let's start with the basics.</p>

          <Section title="Event details">
            <div>
              <Label htmlFor="f-title" required>Event name</Label>
              <div className="relative">
                <input {...bad('title')} value={values.title} maxLength={75} onChange={on('title')} placeholder="Event name" className={`${inputCls(errors.title)} pr-16`} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink/50">{values.title.length}/75</span>
              </div>
              <ErrorText id="e-title">{errors.title}</ErrorText>
            </div>
            <div>
              <Label htmlFor="f-description" required>Describe your event</Label>
              <RichTextEditor id="f-description" value={values.description} onChange={set('description')} error={errors.description} />
              <ErrorText id="e-description">{errors.description}</ErrorText>
            </div>
          </Section>

          <Section title="Event location">
            <div>
              <Label htmlFor="f-country" required>Country</Label>
              <SelectBox id="f-country" value={values.country} onChange={set('country')} options={COUNTRIES} placeholder="" error={errors.country} />
            </div>
            <div>
              {/* Address autocomplete + map pin need a Google Maps key; plain text for now. */}
              <Label htmlFor="f-address" required>Location of event</Label>
              <input {...bad('address')} value={values.address} maxLength={200} onChange={on('address')} placeholder="Venue name and address" className={inputCls(errors.address)} />
              <ErrorText id="e-address">{errors.address}</ErrorText>
            </div>
            <div>
              <Label htmlFor="f-locationTip">Location tip</Label>
              <input id="f-locationTip" value={values.locationTip} maxLength={300} onChange={on('locationTip')} placeholder="Help people find your event location" className={inputCls(false)} />
            </div>
            <div>
              <Label htmlFor="f-slug">Use custom URL <Info size={12} className="ml-1 inline" aria-label="A short, memorable link for your event page" /></Label>
              <div className={`flex overflow-hidden rounded-lg border ${errors.slug ? 'border-red-500' : 'border-ink/20'}`}>
                <span className="whitespace-nowrap border-r border-ink/20 bg-gray-50 px-4 py-3 text-sm">{window.location.host}/discover/</span>
                <input {...bad('slug')} value={values.slug} maxLength={60} placeholder="my-event" className="min-w-0 flex-1 px-4 py-3 text-sm outline-none"
                  onChange={(e) => set('slug')(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} />
              </div>
              <ErrorText id="e-slug">{errors.slug}</ErrorText>
            </div>
          </Section>

          <Section title="Event format">
            <div>
              <Label htmlFor="f-format" required>What does your event feel like?</Label>
              <SelectBox id="f-format" value={values.format} onChange={set('format')} options={FORMATS} error={errors.format} />
              <ErrorText id="e-format">{errors.format}</ErrorText>
            </div>
          </Section>

          <Section title="Event Categories">
            <p className="-mt-3 text-xs text-ink/80"><span className="text-brand">*</span> What's this event about? Pick up to 2 categories that describe it best.</p>
            <CategoryPicker value={values.tags} onChange={set('tags')} />
            <ErrorText id="e-tags">{errors.tags}</ErrorText>
          </Section>

          <Section title="Event schedule" hint="Set the frequency, date and time.">
            <div className="flex gap-3 text-sm">
              <span className="rounded-lg bg-blush px-5 py-3 text-brand">Single Event</span>
              <button type="button" disabled title="Coming soon" className="cursor-not-allowed rounded-lg border border-ink/20 px-5 py-3 opacity-60">Recurring Event</button>
            </div>
            <div>
              <Label htmlFor="f-timezone" required>Choose a time zone</Label>
              <SelectBox id="f-timezone" value={values.timezone} onChange={set('timezone')} options={TIMEZONES} placeholder="" />
            </div>
            {[['start', 'Start'], ['end', 'End']].map(([p, name]) => (
              <div key={p}>
                <Label htmlFor={`f-${p}Date`} required>{name} date</Label>
                <div className="grid grid-cols-[1fr_1fr] gap-3 sm:grid-cols-[2fr_1.2fr_90px]">
                  <input {...bad(`${p}Date`)} type="date" value={values[`${p}Date`]} min={p === 'end' && values.startDate ? values.startDate : undefined}
                    onChange={on(`${p}Date`)} className={inputCls(errors[`${p}Date`])} />
                  <input {...bad(`${p}Time`)} value={values[`${p}Time`]} onChange={on(`${p}Time`)} placeholder={`${name} time (hh:mm)`} maxLength={5} inputMode="numeric" className={inputCls(errors[`${p}Time`])} />
                  <select aria-label={`${name} AM or PM`} value={values[`${p}AmPm`]} onChange={on(`${p}AmPm`)} className={inputCls(false)}><option>AM</option><option>PM</option></select>
                </div>
                <ErrorText id={`e-${p}Date`}>{errors[`${p}Date`]}</ErrorText>
                <ErrorText id={`e-${p}Time`}>{errors[`${p}Time`]}</ErrorText>
              </div>
            ))}
          </Section>

          <Section title="Event Lineup" hint="Showcase speakers, headliners, artists of your event">
            <LineupEditor title={values.lineupTitle} onTitle={set('lineupTitle')} items={values.lineup} onItems={set('lineup')}
              upload={(file) => uploadMedia(user.id, id ?? 'drafts', file)} />
          </Section>

          <Section title="Social Details">
            {[['website', 'https://yourwebsite.url/'], ['instagram', 'Your Instagram Handle'], ['x', 'Your X(Twitter) Handle'], ['facebook', 'Your Facebook URL']].map(([k, ph]) => (
              <div key={k}>
                <input {...bad(k)} aria-label={ph} value={values.social[k]} onChange={setSocial(k)} placeholder={ph} maxLength={200} className={inputCls(errors[k])} />
                <ErrorText id={`e-${k}`}>{errors[k]}</ErrorText>
              </div>
            ))}
          </Section>

          <div className="mt-12 flex justify-center gap-4">
            <button type="button" onClick={() => navigate('/dashboard/events')} className="rounded-lg bg-[#fdece8] px-10 py-3 text-sm text-brand hover:bg-[#fbdcd3]">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-brand px-10 py-3 text-sm text-white hover:bg-brand-dark disabled:opacity-60">{saving ? 'Saving…' : 'Continue'}</button>
          </div>
        </form>
      )}
    </WizardShell>
  )
}
