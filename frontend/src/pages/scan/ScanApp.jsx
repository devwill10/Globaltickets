import { Routes, Route, Navigate } from 'react-router-dom'
import ScanSignIn from './ScanSignIn'
import ScanEvents from './ScanEvents'
import ScanEvent from './ScanEvent'
import ScanQr from './ScanQr'
import ScanResult from './ScanResult'
import { scanPath } from '../../services/scan'

// Everything on the scan page (scan.yourdomain.com, or /scan while developing)
export default function ScanApp() {
  return (
    <Routes>
      <Route index element={<ScanSignIn />} />
      <Route path="events" element={<ScanEvents />} />
      <Route path="events/:id" element={<ScanEvent />} />
      <Route path="events/:id/qr" element={<ScanQr />} />
      <Route path="events/:id/ticket/:code" element={<ScanResult />} />
      <Route path="*" element={<Navigate to={scanPath('/')} replace />} />
    </Routes>
  )
}
