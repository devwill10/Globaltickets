import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// Convenience guard for the UI. Real protection is the database rules (RLS).
export default function RequireAuth({ children }) {
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)
  const location = useLocation()
  if (!initialized) return <div className="grid min-h-screen place-items-center text-ink/60" role="status">Loading…</div>
  // Ticket buyers often have no password, so send them to the email sign-in link page instead of the password login
  if (!user) return <Navigate to={location.pathname.startsWith('/dashboard/tickets') ? '/tickets/sign-in' : '/login'} replace state={{ from: location }} />
  return children
}
