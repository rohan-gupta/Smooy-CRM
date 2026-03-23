import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Otp from './pages/Otp'
import Signup from './pages/Signup'
import SignUpSuccess from './pages/SignUpSuccess'
import CustomerRewards from './pages/CustomerRewards'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup-success" element={<SignUpSuccess />} />
      <Route path="/customer-rewards" element={<CustomerRewards />} />
    </Routes>
  )
}
