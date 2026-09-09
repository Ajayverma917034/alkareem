import React from 'react'
import Navbar from './components/Navbar'
import HeroCarousel from './components/home/Herocarousel'
import Home from './pages/Home'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import About from './pages/About'
import Authors from './pages/Authors'
import Founder from './pages/Founder'
import Login from './pages/Login'
import { Toaster } from 'sonner'
import Donate from './pages/Donate'
import VolunteerForm from './pages/VolunteerApplication'
import DignitaryRegistrationForm from './pages/DignitaryRegistrationForm'
import MembershipPlans from './pages/MembershipPlans'
import Sidebar from './components/Sidebar'
import MyDonations from './pages/Mydonations'
import Volunteers from './pages/Volunteers'
import Dignitaries from './pages/Dignitaries'
import Profile from './pages/Profile'
import MySubscriptions from './pages/MySubscriptions'
import MyPayments from './pages/MyPayments'
import ScrollToTop from './components/ScrollToTop'
import Footer from './components/Footer'
import Contact from './pages/Contact'
import DonationReport from './pages/DonationReport'
import PublicVolunteers from './pages/PublicVolunteers'

const App = () => {
  const { pathname } = useLocation();

  const isDashboard = pathname.startsWith("/dashboard");
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/people' element={<Outlet />}>
          <Route path='authors' element={<Authors />} />
          <Route path='founder' element={<Founder />} />
        </Route>
        <Route path='/membership' element={<Outlet />}>
          <Route path='volunteer-form' element={<VolunteerForm />} />
          <Route path='volunteers' element={<PublicVolunteers />} />
          <Route path='dignitary-form' element={<DignitaryRegistrationForm />} />
          <Route path='founder' element={<Founder />} />
          <Route path='paid' element={<MembershipPlans />} />
        </Route>
        <Route path='/donate' element={<Donate />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/donation-report' element={<DonationReport />} />

        <Route path='/dashboard' element={<Sidebar />} >
          <Route path='donations' element={<MyDonations />} />
          <Route path='volunteers' element={<Volunteers />} />
          <Route path='dignitaries' element={<Dignitaries />} />
          <Route path='profile' element={<Profile />} />
          <Route path='my-subscriptions' element={<MySubscriptions />} />
          <Route path='my-payments' element={<MyPayments />} />

        </Route>

      </Routes>
      {!isDashboard && <Footer />}
    </>
  )
}

export default App