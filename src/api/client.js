const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function normalizePhone(phone) {
  return (phone || '').replace(/\s+/g, '')
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const error = new Error(data?.message || `Request failed: ${res.status}`)
    error.status = res.status
    throw error
  }
  return data
}

export function enrollCustomer(phone, name, email = '', dob = '') {
  return request('/customers', {
    method: 'POST',
    body: JSON.stringify({ phone: normalizePhone(phone), name, email, dob }),
  })
}

export function getCustomer(phone) {
  return request(`/customers/${encodeURIComponent(normalizePhone(phone))}`)
}

export function addStamp(phone) {
  return request(`/customers/${encodeURIComponent(normalizePhone(phone))}/stamps`, {
    method: 'POST',
  })
}

export function updateRewardStatus(phone, rewardId, status) {
  return request(
    `/customers/${encodeURIComponent(normalizePhone(phone))}/rewards/${rewardId}`,
    { method: 'PATCH', body: JSON.stringify({ status }) }
  )
}
