import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Coins } from 'lucide-react'
import RichTextEditor from '../../components/dashboard/RichTextEditor'
import { Label, ErrorText, inputCls } from '../../components/dashboard/FormBits'
import { recipientCount, getCredits, listSegments, getEventTitle, sendCampaign, sendTestEmail } from '../../services/marketing'
import { AUTO_SEGMENTS, CREDIT_COST } from '../../data/marketing'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../components/Toast'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID = /^[0-9a-fA-F-]{36}$/
const TITLES = { event: 'Email event attendees', subscribers: 'Email subscribers', segment: 'Email segment subscribers' }

export default function EmailComposer() {
  const [params] = useSearchParams()
  const audience = params.get('audience'), ref = params.get('ref')
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [count, setCount] = useState(null)
  const [credits, setCredits] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [v, setV] = useState({ sender: user.name || '', replyTo: user.email || '', subject: '', body: '', test: user.email || '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState('')

  const valid = TITLES[audience] && (audience === 'subscribers' || ref)
  useEffect(() => {
    if (!valid) return
    let off = false
    ;(async () => {
      try {
        const [c, cr] = await Promise.all([recipientCount(audience, ref), getCredits()])
        let label = 'All subscribers'
        if (audience === 'event') label = (await getEventTitle(user.id, ref)) ?? 'Event attendees'
        if (audience === 'segment') label = UUID.test(ref) ? ((await listSegments(user.id)).find((s) => s.id === ref)?.name ?? 'Segment') : (AUTO_SEGMENTS.find((s) => s.key === ref)?.title ?? 'Segment')
        if (!off) { setCount(c); setCredits(cr); setName(label) }
      } catch (e) { if (!off) setLoadError(e.message) }
    })()
    return () => { off = true }
  }, [valid, audience, ref, user.id])

  if (!valid) return <Navigate to="/dashboard/marketing" replace />

  const set = (k) => (e) => { setV((x) => ({ ...x, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: undefined })) }
  const cost = (count ?? 0) * CREDIT_COST
  const short = credits !== null && cost > credits
  const noOne = count === 0

  function validate(needTest) {
    const e = {}
    if (v.sender.trim().length < 2) e.sender = 'Enter a sender name.'
    if (!EMAIL.test(v.replyTo.trim())) e.replyTo = 'Enter a valid reply-to email.'
    if (v.subject.trim().length < 3) e.subject = 'Enter an email subject.'
    if (!v.body.replace(/<[^>]*>/g, '').trim()) e.body = 'Write your message.'
    if (needTest && !EMAIL.test(v.test.trim())) e.test = 'Enter a valid email address.'
    setErrors(e)
    const key = Object.keys(e)[0]
    if (key) document.getElementById(key === 'body' ? 'mc-message' : `mc-${key}`)?.focus()
    return !key
  }

  async function act(kind) {
    if (!validate(kind === 'test')) return
    setBusy(kind)
    try {
      if (kind === 'test') await sendTestEmail({ ...v })
      else { await sendCampaign({ audience, ref, ...v }); toast('Email sent'); navigate('/dashboard/marketing') }
    } catch (e) { toast(e.message, 'error') } finally { setBusy('') }
  }

  return (
    <div className="max-w-3xl">
      <Link to="/dashboard/marketing" className="inline-flex items-center gap-1 text-sm hover:text-brand"><ChevronLeft size={16} />Back</Link>
      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{TITLES[audience]}</h1>
          <p className="mt-1 text-xs">{audience === 'segment' ? 'Segment' : audience === 'event' ? 'Event' : 'Audience'}: <b className="text-brand">{name || '…'}</b></p>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-ink/70">Credit balance: <Coins size={13} className="text-brand" aria-label="credits" /><b className="text-sm text-ink">{credits ?? 0}</b></p>
      </div>

      <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">Sending email isn't switched on yet. You can write your email here, but it can't be sent until the email service and credits are set up.</p>
      {loadError && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>}

      <form onSubmit={(e) => e.preventDefault()} noValidate className="mt-6 grid gap-5 sm:grid-cols-2">
        <div><Label htmlFor="mc-sender" required>Sender name</Label><input id="mc-sender" value={v.sender} onChange={set('sender')} maxLength={80} aria-invalid={Boolean(errors.sender)} className={inputCls(errors.sender)} /><ErrorText>{errors.sender}</ErrorText></div>
        <div><Label htmlFor="mc-replyTo" required>Reply to</Label><input id="mc-replyTo" type="email" value={v.replyTo} onChange={set('replyTo')} maxLength={254} aria-invalid={Boolean(errors.replyTo)} className={inputCls(errors.replyTo)} /><ErrorText>{errors.replyTo}</ErrorText></div>
        <div><Label htmlFor="mc-recipients" required>Recipients</Label><input id="mc-recipients" value={`${name}${count !== null ? ` (${count})` : ''}`} disabled className={inputCls(false)} /></div>
        <div><Label htmlFor="mc-subject" required>Email subject</Label><input id="mc-subject" value={v.subject} onChange={set('subject')} maxLength={150} aria-invalid={Boolean(errors.subject)} className={inputCls(errors.subject)} /><ErrorText>{errors.subject}</ErrorText></div>
        <div className="sm:col-span-2">
          <Label htmlFor="mc-message" required>Message</Label>
          <RichTextEditor id="mc-message" value={v.body} onChange={(html) => { setV((x) => ({ ...x, body: html })); setErrors((er) => ({ ...er, body: undefined })) }} error={errors.body} />
          <ErrorText>{errors.body}</ErrorText>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="mc-test">Email address to send test</Label>
          <div className="flex gap-3">
            <input id="mc-test" type="email" value={v.test} onChange={set('test')} aria-invalid={Boolean(errors.test)} className={inputCls(errors.test)} />
            <button type="button" onClick={() => act('test')} disabled={Boolean(busy)} className="shrink-0 rounded-lg border border-ink/20 px-6 text-sm hover:border-brand disabled:opacity-60">{busy === 'test' ? 'Sending…' : 'Send test'}</button>
          </div>
          <ErrorText>{errors.test}</ErrorText>
        </div>
      </form>

      <div className="mt-6 flex flex-col items-end gap-2">
        <div className="flex items-center gap-4">
          <p className="flex items-center gap-1.5 text-xs">Cost: <Coins size={13} className="text-brand" aria-label="credits" /><b className="text-sm">{cost}</b></p>
          <button type="button" onClick={() => act('send')} disabled={Boolean(busy) || noOne || short || count === null}
            className="rounded-lg bg-brand px-6 py-3 text-sm text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50">{busy === 'send' ? 'Sending…' : 'Send Email'}</button>
        </div>
        {noOne && <p className="text-xs text-ink/70">There are no recipients to send this email to.</p>}
        {!noOne && short && <p className="text-xs text-ink/70">You need {cost} credits to send this email, and you have {credits}.</p>}
      </div>
    </div>
  )
}
