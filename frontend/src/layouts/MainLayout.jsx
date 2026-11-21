import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SupportButton from '../components/SupportButton'

export default function MainLayout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <>
      <Navbar />
      <main><Outlet /></main>
      <Footer />
      <SupportButton />
    </>
  )
}
