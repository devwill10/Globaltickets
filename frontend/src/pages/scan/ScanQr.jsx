import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { Guarded, Header, PrimaryButton } from './ScanShell'
import { scanPath } from '../../services/scan'

const CODE = /^[0-9a-f]{32}$/i // what our tickets' QR codes contain

export default function ScanQr() {
  const { id } = useParams()
  const nav = useNavigate()
  const [error, setError] = useState('')
  const [bad, setBad] = useState('')

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader')
    let found = false
    const started = scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: (w, h) => { const s = Math.floor(Math.min(w, h) * 0.8); return { width: s, height: s } } },
      (text) => {
        const code = text.trim()
        if (!CODE.test(code)) { setBad("That QR code isn't a TicketsGlobal ticket."); return }
        if (found) return
        found = true
        nav(scanPath(`/events/${id}/ticket/${code.toLowerCase()}`), { replace: true })
      },
      () => {},
    ).catch(() => setError("We couldn't open the camera. Allow camera access for this site in your browser settings, then try again."))

    return () => { started.then(() => scanner.stop()).then(() => scanner.clear()).catch(() => {}) }
  }, [id, nav])

  return (
    <Guarded>
      <Header title="Scan QR code" />
      <div className="mt-14 text-center">
        <p className="text-xl">Keep the QR code inside the area.</p>
        <p className="mt-1 text-sm">Scanning will start automatically</p>
      </div>
      <div className="mx-auto mt-8 aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl bg-ink">
        <div id="qr-reader" className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />
      </div>
      <div className="mt-4 min-h-12 text-center" aria-live="polite">
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {!error && bad && <p className="text-sm text-red-600">{bad}</p>}
      </div>
      <PrimaryButton className="mt-6" onClick={() => nav(scanPath(`/events/${id}`), { replace: true })}>Go Back</PrimaryButton>
    </Guarded>
  )
}
