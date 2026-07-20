import { createContext, useContext, useState, useCallback } from 'react'

const TOTAL_STAMPS = 10

function normalizePhone(phone) {
  return (phone || '').replace(/\s+/g, '')
}

const SEED_CUSTOMERS = {
  '+65 8123 4567': {
    name: 'Sarah Miller',
    stamps: 5,
    rewards: [
      { id: 1, title: '20% OFF', description: 'The Next Froyo', status: 'redeemable' },
      { id: 2, title: 'Upsize', description: 'At 5 Stamps', status: 'redeemed' },
    ],
  },
  '+65 9234 5678': {
    name: 'John Tan',
    stamps: 2,
    rewards: [
      { id: 1, title: '20% OFF', description: 'The Next Froyo', status: 'redeemable' },
    ],
  },
}

const RewardsContext = createContext(null)

export function RewardsProvider({ children }) {
  const [customers, setCustomers] = useState(() => {
    const normalized = {}
    for (const [phone, data] of Object.entries(SEED_CUSTOMERS)) {
      normalized[normalizePhone(phone)] = data
    }
    return normalized
  })

  const getCustomer = useCallback(
    (phone) => customers[normalizePhone(phone)] || null,
    [customers]
  )

  const enrollCustomer = useCallback((phone, name) => {
    const key = normalizePhone(phone)
    setCustomers((prev) => ({
      ...prev,
      [key]: prev[key] || { name, stamps: 0, rewards: [] },
    }))
  }, [])

  const updateRewardStatus = useCallback((phone, rewardId, newStatus) => {
    const key = normalizePhone(phone)
    setCustomers((prev) => {
      const customer = prev[key]
      if (!customer) return prev
      return {
        ...prev,
        [key]: {
          ...customer,
          rewards: customer.rewards.map((r) =>
            r.id === rewardId ? { ...r, status: newStatus } : r
          ),
        },
      }
    })
  }, [])

  const addStamp = useCallback((phone) => {
    const key = normalizePhone(phone)
    setCustomers((prev) => {
      const customer = prev[key]
      if (!customer) return prev
      return {
        ...prev,
        [key]: { ...customer, stamps: Math.min(customer.stamps + 1, TOTAL_STAMPS) },
      }
    })
  }, [])

  return (
    <RewardsContext.Provider
      value={{
        totalStamps: TOTAL_STAMPS,
        getCustomer,
        enrollCustomer,
        updateRewardStatus,
        addStamp,
      }}
    >
      {children}
    </RewardsContext.Provider>
  )
}

export function useRewards() {
  const ctx = useContext(RewardsContext)
  if (!ctx) throw new Error('useRewards must be used within RewardsProvider')
  return ctx
}
