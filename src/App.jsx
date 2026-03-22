import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Customer from './pages/Customer'
import Staff from './pages/Staff'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/customer" element={<Customer />} />
      <Route path="/staff" element={<Staff />} />
    </Routes>
  )
}
