import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import AuthArt from '../components/AuthArt'
import { useAuthStore } from '../store/authStore'

// Split-screen layout for /signup, /login and /reset-password (no navbar or footer).
export default function AuthLayout() {
  const isLoggedIn = useAuthStore((s) => Boolean(s.user))
  const { pathname, state } = useLocation()

  // Logged-in users go back to the page they were trying to reach, or the dashboard.
  // These two pages are opened from email links and must stay visible even when a session exists.
  const keepOpen = ['/update-password', '/auth/callback'].includes(pathname)
  if (isLoggedIn && !keepOpen) return <Navigate to={state?.from?.pathname ?? '/dashboard'} replace />

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[11fr_9fr]">
      <div className="px-6 py-10 sm:px-12 lg:px-16 lg:py-14">
        <div className="mx-auto max-w-xl lg:mx-0">
          <Link to="/" className="text-4xl font-medium tracking-tight text-brand">ticketsglobal</Link>
          <Outlet />
        </div>
      </div>
      <div className="sticky top-0 hidden h-screen lg:block">
        <AuthArt variant={pathname === '/login' ? 'peach' : 'blue'} />
      </div>
    </div>
  )
}
