import { Navigate } from 'react-router-dom'

export const STAFF_SESSION_KEY = 'smooy_staff_authed'
export const CUSTOMER_SESSION_KEY = 'smooy_customer_phone'

export function RequireStaffAuth({ children }) {
  const authed = sessionStorage.getItem(STAFF_SESSION_KEY) === 'true'
  return authed ? children : <Navigate to="/staff-login" replace />
}

export function RequireCustomerAuth({ children }) {
  const phone = sessionStorage.getItem(CUSTOMER_SESSION_KEY)
  return phone ? children : <Navigate to="/" replace />
}
