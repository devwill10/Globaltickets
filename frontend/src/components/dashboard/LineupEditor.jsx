import { useRef, useState } from 'react'
import { ImagePlus, Link2, Pencil, Trash2, LayoutGrid, Star } from 'lucide-react'
import { Label, ErrorText, SelectBox, inputCls } from './FormBits'
import { LINEUP_TITLES, LINEUP_ROLES } from '../../data/eventOptions'

const blank = { name: '', description: '', role: '', image_url: '', link: '' }
const MAX_BYTES = 2 * 1024 * 1024

export default function LineupEditor({ title, onTitle, items, onItems, upload }) {
  const [draft, setDraft] = useState(null) // { index: number|null, ...fields }
  const [showLink, setShowLink] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  async function pick(e) {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    if (!['image/jpeg', 'image/png'].includes(f.type)) return setErr('Use a JPEG or PNG image.')
    if (f.size > MAX_BYTES) return setErr('The maximum upload file size is 2MB.')
    setErr(''); setBusy(true)
    try { set('image_url', (await upload(f)).url) } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }

  function save() {
    if (!draft.name.trim()) return setErr('Enter a name.')
    if (!draft.image_url) return setErr('Upload an image.')
    if (draft.link && !/^https?:\/\//i.test(draft.link)) return setErr('The social link must start with https://')
    const { index, ...entry } = draft
    entry.name = entry.name.trim()
    onItems(index == null ? [...items, entry] : items.map((x, i) => (i === index ? entry : x)))
    if (!title) onTitle('Artists')
    setDraft(null); setShowLink(false); setErr('')
  }

  const open = (d) => { setDraft(d); setShowLink(Boolean(d.link)); setErr('') }

  return (
    <div>
      <Label htmlFor="f-lineupTitle">Lineup Title</Label>
      <SelectBox id="f-lineupTitle" value={title} onChange={onTitle} options={LINEUP_TITLES}
        placeholder="Kindly select a lineup title" disabled={items.length > 0} />

      <ul className="mt-4 space-y-3">
        {items.map((it, i) => (draft?.index === i ? null : (
          <li key={i} className="flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-3">
            <img src={it.image_url} alt="" className="h-12 w-12 rounded object-cover" />
            <span className="flex-1 text-sm font-medium">{it.name}{it.role && <span className="ml-2 rounded bg-blush px-2 py-0.5 text-xs text-brand">{it.role}</span>}</span>
            <button type="button" aria-label={`Edit ${it.name}`} onClick={() => open({ index: i, ...blank, ...it })} className="text-brand"><Pencil size={16} /></button>
            <button type="button" aria-label={`Remove ${it.name}`} onClick={() => onItems(items.filter((_, x) => x !== i))} className="text-brand"><Trash2 size={16} /></button>
          </li>
        )))}
      </ul>

      {draft && (
        <div className="mt-4 grid gap-5 rounded-lg border border-ink/10 bg-white p-5 sm:grid-cols-[150px_1fr]">
          <div>
            <button type="button" onClick={() => fileRef.current?.click()} aria-label="Upload image"
              className="grid aspect-square w-full place-items-center overflow-hidden rounded-lg bg-gray-100 text-xs hover:bg-gray-200">
              {draft.image_url ? <img src={draft.image_url} alt="" className="h-full w-full object-cover" /> : (
                <span className="flex flex-col items-center gap-2"><ImagePlus size={28} />{busy ? 'Uploading…' : <><span className="text-brand">*</span> Click to upload</>}</span>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={pick} />
            <p className="mt-2 text-center text-[11px] text-ink/70"><span className="text-brand">*</span> The maximum upload file size is 2MB.</p>
          </div>
          <div className="space-y-4">
            <div><Label htmlFor="lu-name" required>Name</Label>
              <input id="lu-name" value={draft.name} maxLength={80} onChange={(e) => set('name', e.target.value)} placeholder="Name" className={inputCls(false)} /></div>
            <div><Label htmlFor="lu-desc">Description</Label>
              <input id="lu-desc" value={draft.description} maxLength={150} onChange={(e) => set('description', e.target.value)} placeholder="e.g 2x Grammy award winning Performer" className={inputCls(false)} /></div>
            <div>
              <p className="mb-1.5 text-xs text-ink/80">Role</p>
              <div className="flex flex-wrap gap-2">
                {LINEUP_ROLES.map((r) => (
                  <button key={r} type="button" aria-pressed={draft.role === r} onClick={() => set('role', draft.role === r ? '' : r)}
                    className={`inline-flex items-center gap-1 rounded border px-3 py-1.5 text-xs ${draft.role === r ? 'border-brand bg-blush text-brand' : 'border-ink/30'}`}>
                    {r === 'Headliner' && <Star size={12} className="fill-brand text-brand" />}{r}
                  </button>
                ))}
              </div>
            </div>
            {showLink
              ? <input aria-label="Social link" value={draft.link} onChange={(e) => set('link', e.target.value)} placeholder="https://instagram.com/…" className={inputCls(false)} />
              : <button type="button" onClick={() => setShowLink(true)} className="inline-flex items-center gap-2 text-sm"><Link2 size={16} /> add social link</button>}
            <ErrorText>{err}</ErrorText>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setDraft(null); setErr('') }} className="rounded-lg px-5 py-2.5 text-sm text-ink/70 hover:bg-gray-100">Cancel</button>
              <button type="button" onClick={save} disabled={busy} className="rounded-lg bg-brand px-6 py-2.5 text-sm text-white hover:bg-brand-dark disabled:opacity-60">Save</button>
            </div>
          </div>
        </div>
      )}

      <button type="button" disabled={Boolean(draft)} onClick={() => open({ index: null, ...blank })}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink/20 py-5 text-sm text-brand hover:bg-blush disabled:opacity-50">
        <LayoutGrid size={16} /> Add lineup
      </button>
    </div>
  )
}
