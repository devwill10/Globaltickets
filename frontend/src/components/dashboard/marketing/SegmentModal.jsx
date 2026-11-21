import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../../Modal'
import { Label, ErrorText, inputCls } from '../FormBits'
import { CONDITIONS } from '../../../data/marketing'
import { saveSegment } from '../../../services/marketing'

// segment = existing segment to edit (omit to create)
export default function SegmentModal({ segment, onClose, onSaved }) {
  const [name, setName] = useState(segment?.name ?? '')
  const [match, setMatch] = useState(segment?.match ?? 'all')
  const [conds, setConds] = useState(segment?.conditions?.length ? segment.conditions.map((c) => ({ type: c.type, value: String(c.value) })) : [{ type: '', value: '' }])
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)

  const setCond = (i, k, v) => { setConds((c) => c.map((x, j) => (j === i ? { ...x, [k]: v } : x))); setErrors((e) => ({ ...e, [`c${i}`]: undefined })) }

  async function submit(ev) {
    ev.preventDefault()
    const errs = {}
    if (name.trim().length < 2) errs.name = 'Enter a segment name.'
    conds.forEach((c, i) => {
      const n = Number(c.value)
      if (!c.type) errs[`c${i}`] = 'Choose a condition.'
      else if (c.value === '' || !(n >= 0)) errs[`c${i}`] = 'Enter a number.'
      else if (c.type === 'last_within_months' && !(Number.isInteger(n) && n >= 1)) errs[`c${i}`] = 'Enter a whole number of months.'
    })
    setErrors(errs); setServerError('')
    if (Object.keys(errs).length) return
    setSaving(true)
    try { onSaved(await saveSegment({ name, match, conditions: conds }, segment?.id), !segment) }
    catch (e) { setServerError(e.message) } finally { setSaving(false) }
  }

  return (
    <Modal title={segment ? 'Edit segment' : 'Create a segment'} align="left" onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg bg-[#fdece8] px-8 py-3 text-sm text-brand hover:bg-[#fbdcd3]">Cancel</button>
          <button type="submit" form="segment-form" disabled={saving} className="rounded-lg bg-brand px-8 py-3 text-sm text-white hover:bg-brand-dark disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      }>
      <form id="segment-form" onSubmit={submit} noValidate className="space-y-5">
        {serverError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}
        <div>
          <Label htmlFor="sg-name" required>Segment name</Label>
          <input id="sg-name" value={name} onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined })) }} maxLength={80} aria-invalid={Boolean(errors.name)} className={inputCls(errors.name)} />
          <ErrorText>{errors.name}</ErrorText>
        </div>

        <fieldset>
          <legend className="mb-3 text-sm font-bold">Conditions</legend>
          <div className="space-y-3">
            {conds.map((c, i) => (
              <div key={i}>
                {i === 1 && (
                  <div role="radiogroup" aria-label="Match all or any condition" className="mb-3 inline-flex rounded-lg bg-gray-100 p-1 text-xs">
                    {[['all', 'AND'], ['any', 'OR']].map(([v, l]) => (
                      <button key={v} type="button" role="radio" aria-checked={match === v} onClick={() => setMatch(v)}
                        className={`rounded-md px-4 py-1.5 ${match === v ? 'bg-white shadow-sm' : 'text-ink/60'}`}>{l}</button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <select aria-label={`Condition ${i + 1}`} value={c.type} onChange={(e) => setCond(i, 'type', e.target.value)} className={`${inputCls(errors[`c${i}`])} min-w-0 flex-[3]`}>
                    <option value="">Select a condition</option>
                    {CONDITIONS.map((o) => <option key={o.type} value={o.type}>{o.label}</option>)}
                  </select>
                  <input aria-label={`Value for condition ${i + 1}`} value={c.value} onChange={(e) => setCond(i, 'value', e.target.value)} inputMode="decimal" className={`${inputCls(errors[`c${i}`])} min-w-0 flex-[2]`} />
                  <button type="button" aria-label="Remove condition" disabled={conds.length === 1} onClick={() => setConds((x) => x.filter((_, j) => j !== i))} className="text-ink/60 enabled:hover:text-red-600 disabled:opacity-30"><Trash2 size={16} /></button>
                </div>
                <ErrorText>{errors[`c${i}`]}</ErrorText>
              </div>
            ))}
          </div>
          {conds.length < 10 && (
            <button type="button" onClick={() => setConds((x) => [...x, { type: '', value: '' }])} className="mt-3 inline-flex items-center gap-1 text-xs text-brand"><Plus size={12} />New condition</button>
          )}
          <p className="mt-3 text-xs text-ink/60">Amounts are compared in the currency each customer paid in. "Emails opened" will start counting once email tracking is added.</p>
        </fieldset>
      </form>
    </Modal>
  )
}
