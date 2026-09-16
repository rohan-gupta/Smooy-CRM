// Per-customer stamp cooldown, tracked in the staff browser session.
// Prevents adding more than one stamp to the same customer within the
// cooldown window. Cleared when staff logs in again (see StaffLogin).

export const STAMP_COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes
const PREFIX = 'smooy_stamp_cd_'

function keyFor(phone) {
  return PREFIX + (phone || '').replace(/\s+/g, '')
}

// Milliseconds remaining before another stamp is allowed for this customer.
// Returns 0 when not in cooldown.
export function getCooldownRemaining(phone) {
  const ts = Number(sessionStorage.getItem(keyFor(phone)) || 0)
  if (!ts) return 0
  const remaining = STAMP_COOLDOWN_MS - (Date.now() - ts)
  return remaining > 0 ? remaining : 0
}

export function startCooldown(phone) {
  sessionStorage.setItem(keyFor(phone), String(Date.now()))
}

// Wipe all customer cooldowns — called on staff login so a fresh login
// resets the limit.
export function clearAllCooldowns() {
  Object.keys(sessionStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => sessionStorage.removeItem(k))
}
