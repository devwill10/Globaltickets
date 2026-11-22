import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Events from './pages/Events'
import HowItWorks from './pages/HowItWorks'
import Pricing from './pages/Pricing'
import About from './pages/About'
import AuthLayout from './layouts/AuthLayout'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import AuthCallback from './pages/AuthCallback'
import UpdatePassword from './pages/UpdatePassword'
import RequireAuth from './components/RequireAuth'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardEvents from './pages/dashboard/Events'
import EventDetailsStep from './pages/dashboard/EventDetailsStep'
import EventAppearanceStep from './pages/dashboard/EventAppearanceStep'
import EventTicketsStep from './pages/dashboard/EventTicketsStep'
import ComingSoon from './pages/dashboard/ComingSoon'
import MyTickets from './pages/dashboard/MyTickets'
import Discounts from './pages/dashboard/Discounts'
import Marketing from './pages/dashboard/Marketing'
import BoxOffices from './pages/dashboard/BoxOffices'
import Account from './pages/dashboard/Account'
import BoxOfficeEditor from './pages/dashboard/BoxOfficeEditor'
import BoxOfficePage from './pages/BoxOfficePage'
import EmailComposer from './pages/dashboard/EmailComposer'
import EventDetails from './pages/EventDetails'
import OrderSuccess from './pages/OrderSuccess'
import TicketSignIn from './pages/TicketSignIn'
import ConfirmSignIn from './pages/ConfirmSignIn'
import ScanApp from './pages/scan/ScanApp'
import HelpLayout from './pages/help/HelpLayout'
import EventPage from './pages/dashboard/event/EventPage'
import EventFinance from './pages/dashboard/event/EventFinance'
import EventAttendees from './pages/dashboard/event/EventAttendees'
import EventReports from './pages/dashboard/event/EventReports'
import EventSettings from './pages/dashboard/event/EventSettings'
import HelpHome from './pages/help/HelpHome'
import HelpCategory from './pages/help/HelpCategory'
import HelpArticle from './pages/help/HelpArticle'
import { IS_SCAN_HOST } from './services/scan'

export default function App() {
  useEffect(() => {
    useAuthStore.getState().init() // start listening to the Supabase session
    // An already-used or expired email link comes back with error details in the address bar; tidy them away
    const q = new URLSearchParams(window.location.search)
    if (q.has('error_code') || q.has('error_description')) {
      ['error', 'error_code', 'error_description'].forEach((k) => q.delete(k))
      const rest = q.toString()
      window.history.replaceState({}, '', window.location.pathname + (rest ? `?${rest}` : '') + window.location.hash)
    } else if (window.location.hash.startsWith('#error')) {
      window.history.replaceState({}, '', window.location.pathname + window.location.search)
    }
  }, [])

  // scan.yourdomain.com serves only the staff check-in pages, at the root
  if (IS_SCAN_HOST) return <Routes><Route path="/*" element={<ScanApp />} /></Routes>

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:key" element={<EventDetails />} />
        <Route path="/discover/bo/:key" element={<BoxOfficePage />} />
        <Route path="/discover/:key" element={<EventDetails />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        {/* Next: /events/:id (event details) */}
      </Route>

      {/* Organizer dashboard (signed-in users only) */}
      <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
        <Route index element={<Navigate to="events" replace />} />
        <Route path="events" element={<DashboardEvents />} />
        <Route path="events/new" element={<EventDetailsStep />} />
        <Route path="events/:id/details" element={<EventDetailsStep />} />
        <Route path="events/:id/appearance" element={<EventAppearanceStep />} />
        <Route path="events/:id/tickets" element={<EventTicketsStep />} />
        <Route path="events/:id" element={<EventPage />}>
          <Route index element={<Navigate to="finance" replace />} />
          <Route path="finance" element={<EventFinance />} />
          <Route path="attendees" element={<EventAttendees />} />
          <Route path="reports" element={<EventReports />} />
          <Route path="settings" element={<EventSettings />} />
        </Route>
        <Route path="discounts" element={<Discounts />} />
        <Route path="marketing" element={<Marketing />} />
        <Route path="marketing/new" element={<EmailComposer />} />
        <Route path="box-office" element={<BoxOffices />} />
        <Route path="box-office/new" element={<BoxOfficeEditor />} />
        <Route path="box-office/:id" element={<BoxOfficeEditor />} />
        <Route path="account" element={<Account />} />
        <Route path="tickets" element={<MyTickets />} />
      </Route>

      {/* Help center (its own header and footer, outside the main layout) */}
      <Route path="/help" element={<HelpLayout />}>
        <Route index element={<HelpHome />} />
        <Route path="category/:cat" element={<HelpCategory />} />
        <Route path="articles/:slug" element={<HelpArticle />} />
      </Route>

      {/* Staff check-in (also served at the root of scan.yourdomain.com) */}
      <Route path="/scan/*" element={<ScanApp />} />

      {/* Email sign-in for ticket buyers (full-screen, no navbar/footer) */}
      <Route path="/tickets/sign-in" element={<TicketSignIn />} />
      <Route path="/auth/confirm" element={<ConfirmSignIn />} />

      {/* Auth pages: no navbar/footer */}
      <Route element={<AuthLayout />}>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Route>
    </Routes>
  )
}
