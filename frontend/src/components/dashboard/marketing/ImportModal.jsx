import { useMemo, useState } from 'react'
import Modal from '../../Modal'
import { importSubscribers } from '../../../services/marketing'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// One address per line: "email" or "email,name" (CSV works too)
function parse(text) {
  const seen = new Set(), rows = []
  for (const line of text.split(/\r?\n/)) {
    const [first, ...rest] = line.split(/[,;\t]/)
    const email = (first ?? '').trim().toLowerCase().replace(/^"|"$/g, '')
    if (!EMAIL.test(email) || email.length > 254 || seen.has(email)) continue
    seen.add(email); rows.push({ email, name: rest.join(' ').trim().replace(/^"|"$/g, '') })
  }
  return rows
}

export default function ImportModal({ onClose, onDone }) {
  const [text, setText] = useState('')
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const rows = useMemo(() => parse(text), [text])

  function readFile(e) {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    if (f.size > 1024 * 1024) return setError('Please choose a file under 1MB.')
    const r = new FileReader()
    r.onload = () => { setText(String(r.result)); setError('') }
    r.readAsText(f)
  }

  async function submit() {
    if (!rows.length) return setError('No valid email addresses found.')
    if (rows.length > 2000) return setError('Import up to 2000 addresses at a time.')
    if (!agree) return setError('Please confirm these people agreed to hear from you.')
    setBusy(true); setError('')
    try { onDone(await importSubscribers(rows), rows.length) } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  return (
    <Modal title="Import subscribers" align="left" onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg bg-[#fdece8] px-8 py-3 text-sm text-brand hover:bg-[#fbdcd3]">Cancel</button>
          <button type="button" onClick={submit} disabled={busy} className="rounded-lg bg-brand px-8 py-3 text-sm text-white hover:bg-brand-dark disabled:opacity-60">{busy ? 'Importing…' : 'Import'}</button>
        </div>
      }>
      <p className="text-sm text-ink/80">Paste addresses below, one per line, as <code>email</code> or <code>email,name</code>. People who buy your tickets and tick "Keep me updated" at checkout are added automatically, so you only need to import people you already have.</p>
      <label htmlFor="imp-text" className="mt-4 block text-xs">Email addresses</label>
      <textarea id="imp-text" value={text} onChange={(e) => { setText(e.target.value); setError('') }} rows={7}
        className="mt-1 w-full rounded-lg border border-ink/20 px-4 py-3 text-sm outline-none focus:border-brand" placeholder={'ada@example.com,Ada\nchidi@example.com'} />
      <div className="mt-2 flex items-center justify-between text-xs text-ink/70">
        <span role="status">{rows.length} valid address{rows.length === 1 ? '' : 'es'} found</span>
        <label className="cursor-pointer text-brand underline">Choose a .csv or .txt file<input type="file" accept=".csv,.txt,text/csv,text/plain" onChange={readFile} className="sr-only" /></label>
      </div>
      <label className="mt-5 flex cursor-pointer items-start gap-2 text-xs">
        <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setError('') }} className="mt-0.5 h-4 w-4 accent-[#fa6540]" />
        I confirm these people agreed to receive emails from me, and I will honour unsubscribe requests.
      </label>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </Modal>
  )
}
