export const REWARD_STATUSES = [
  { value: 'redeemable', label: 'Redeemable', icon: '✅', color: '#16a34a' },
  { value: 'redeemed', label: 'Redeemed', icon: '✖', color: '#d9368b' },
  { value: 'expired', label: 'Expired', icon: '✔', color: '#6b7280' },
  { value: 'locked', label: 'Locked', icon: '🔒', color: '#9ca3af' },
]

export const REWARD_STATUS_MAP = Object.fromEntries(
  REWARD_STATUSES.map((s) => [s.value, s])
)
