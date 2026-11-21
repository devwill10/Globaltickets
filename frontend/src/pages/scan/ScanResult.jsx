import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Guarded, Header, PrimaryButton } from './ScanShell'
import { useToast } from '../../components/Toast'
import { staffTicket, checkedInTime, scanPath, SigninError } from '../../services/scan'

const Row = ({ label, children, tone = '' }) => (
  <div className="mb-7 last:mb-0"><p className="text-ink/70">{label}</p><p className={`mt-1 font-bold ${tone}`}>{children}</p></div>
)

function Body() {
  const { id, code } = useParams()
  const nav = useNavigate()
  const toast = useToast()
  const [res, setRes] = useState(null)
  const [busy, setBusy] = useState(false)

  const handle = (e) => { if (e instanceof SigninError) nav(scanPath('/'), { replace: true }); else setRes({ ok: false, error: e.message }) }

  useEffect(() => {
    let off = false
    staffTicket(code, id, false).then((r) => !off && setRes(r)).catch((e) => !off && handle(e))
    return () => { off = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, id])

  async function checkIn() {
    setBusy(true)
    try {
      const r = await staffTicket(code, id, true)
      setRes(r)
      if (r.ok) toast(r.just_checked_in ? 'Check-in successful!' : 'This ticket was already checked in.', r.just_checked_in ? 'success' : 'error')
    } catch (e) { handle(e) } finally { setBusy(false) }
  }

  const t = res?.ticket
  return (
    <>
      <Header title="Scan QR code" />
      <div className="mt-10">
        {!res && <p className="py-10 text-center text-ink/50">Checking ticket…</p>}
        {res && !res.ok && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center font-medium text-red-700">{res.error}</p>}
        {t && (
          <div className="rounded-2xl border border-ink/10 bg-white p-7 shadow-[0_4px_14px_rgba(0,0,0,.08)]">
            <Row label="Event name">{t.event_title}</Row>
            <Row label="Guest name">{t.guest_name}</Row>
            <Row label="Ticket name">{t.ticket_name}{t.group_size ? ` · admits ${t.group_size}` : ''}</Row>
            <Row label="Status" tone={t.checked_in ? 'text-green-600' : ''}>{t.checked_in ? 'Checked in' : 'Not checked in'}</Row>
            <Row label="Quantity">{t.checked_in ? 1 : 0} / 1</Row>
            {t.checked_in && <Row label="Checked in by">{t.checked_in_by ?? '—'}</Row>}
            {t.checked_in && t.checked_in_at && <Row label="Checked in time">{checkedInTime(t.checked_in_at)}</Row>}
          </div>
        )}
      </div>
      <div className="mt-8">
        {t && !t.checked_in && res.can_check_in
          ? <PrimaryButton onClick={checkIn} disabled={busy}>{busy ? 'Checking in…' : 'Check In'}</PrimaryButton>
          : <PrimaryButton onClick={() => nav(-1)}>Go Back</PrimaryButton>}
        {t && !t.checked_in && !res.can_check_in && <p className="mt-3 text-center text-sm text-ink/60">You can view tickets but not check guests in.</p>}
      </div>
    </>
  )
}

export default function ScanResult() { return <Guarded><Body /></Guarded> }
