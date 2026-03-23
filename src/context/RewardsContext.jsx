import { createContext, useContext, useState, useCallback } from 'react'

const INITIAL_REWARDS = [
  { id: 1, label: '20% OFF', desc: 'The Next Froyo', status: 'redeemable' },
  { id: 2, label: 'Upsize', desc: 'At 5 Stamps', status: 'redeemed' },
]

const RewardsContext = createContext(null)

export function RewardsProvider({ children }) {
  const [rewards, setRewards] = useState(INITIAL_REWARDS)
  const [stamps, setStamps] = useState(5)
  const totalStamps = 10

  const updateRewardStatus = useCallback((id, newStatus) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    )
  }, [])

  const addStamp = useCallback(() => {
    setStamps((prev) => Math.min(prev + 1, totalStamps))
  }, [totalStamps])

  return (
    <RewardsContext.Provider
      value={{ rewards, stamps, totalStamps, updateRewardStatus, addStamp }}
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
