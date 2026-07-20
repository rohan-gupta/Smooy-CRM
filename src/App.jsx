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
import { RequireStaffAuth, RequireCustomerAuth } from './components/auth/RequireAuth'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/signup" element={<RequireCustomerAuth><Signup /></RequireCustomerAuth>} />
      <Route path="/signup-success" element={<RequireCustomerAuth><SignUpSuccess /></RequireCustomerAuth>} />
      <Route path="/customer-rewards" element={<RequireCustomerAuth><CustomerRewards /></RequireCustomerAuth>} />
      <Route path="/staff-login" element={<StaffLogin />} />
      <Route path="/staff-home" element={<RequireStaffAuth><StaffHome /></RequireStaffAuth>} />
      <Route path="/staff-qr-scanner" element={<RequireStaffAuth><StaffQrScanner /></RequireStaffAuth>} />
      <Route path="/staff-phone-search" element={<RequireStaffAuth><StaffPhoneSearch /></RequireStaffAuth>} />
      <Route path="/staff-enroll-member" element={<RequireStaffAuth><StaffEnrollMember /></RequireStaffAuth>} />
      <Route path="/staff-customer-profile" element={<RequireStaffAuth><StaffCustomerProfile /></RequireStaffAuth>} />
    </Routes>
  )
}
