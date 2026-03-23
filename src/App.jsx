import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Otp from './pages/Otp'
import Signup from './pages/Signup'
import SignUpSuccess from './pages/SignUpSuccess'
import CustomerRewards from './pages/CustomerRewards'
import StaffLogin from './pages/StaffLogin'
import StaffHome from './pages/StaffHome'
import StaffQrScanner from './pages/StaffQrScanner'
import StaffPhoneSearch from './pages/StaffPhoneSearch'
import StaffEnrollMember from './pages/StaffEnrollMember'
import StaffCustomerProfile from './pages/StaffCustomerProfile'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup-success" element={<SignUpSuccess />} />
      <Route path="/customer-rewards" element={<CustomerRewards />} />
      <Route path="/staff-login" element={<StaffLogin />} />
      <Route path="/staff-home" element={<StaffHome />} />
      <Route path="/staff-qr-scanner" element={<StaffQrScanner />} />
      <Route path="/staff-phone-search" element={<StaffPhoneSearch />} />
      <Route path="/staff-enroll-member" element={<StaffEnrollMember />} />
      <Route path="/staff-customer-profile" element={<StaffCustomerProfile />} />
    </Routes>
  )
}
