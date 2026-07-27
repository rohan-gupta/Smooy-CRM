import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { Layout } from '../components/layout'
import { GlassCard, QrButton, StampCard } from '../components/customer/RewardsComponents'
import { getCustomer, addStamp, updateRewardStatus } from '../api/client'
import { getCooldownRemaining, startCooldown } from '../utils/stampCooldown'
import { REWARD_STATUSES, REWARD_STATUS_MAP } from '../constants/rewardStatus'

const TOTAL_STAMPS = 10

// Staff may only move a reward between these; 'locked' is not manually
// selectable — a locked reward unlocks on its own at 5 stamps.
const SELECTABLE_STATUSES = REWARD_STATUSES.filter((s) => s.value !== 'locked')

function formatRemaining(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function StatusDropdown({ value, onChange }) {
  const current = REWARD_STATUS_MAP[value] || SELECTABLE_STATUSES[0]

  return (
    <Box position="relative" flexShrink={0}>
      <Box
        as="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        appearance="none"
        bg="white"
        border="2px solid"
        borderColor={current.color}
        color={current.color}
        borderRadius="10px"
        px="12px"
        pr="28px"
        height="clamp(28px, 8.5vw, 36px)"
        fontSize="clamp(11px, 3.3vw, 14px)"
        fontWeight="700"
        cursor="pointer"
        outline="none"
        minW="clamp(100px, 30vw, 130px)"
        textAlign="left"
        sx={{
          '&:focus': { boxShadow: `0 0 0 2px ${current.color}33` },
        }}
      >
        {SELECTABLE_STATUSES.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Box>
      <Box
        position="absolute"
        right="10px"
        top="50%"
        transform="translateY(-50%)"
        pointerEvents="none"
        fontSize="clamp(10px, 3vw, 13px)"
        color={current.color}
      >
        ▼
      </Box>
    </Box>
  )
}

function StaffRewardRow({ label, desc, status, onStatusChange }) {
  const iconInfo = REWARD_STATUS_MAP[status] || REWARD_STATUS_MAP.redeemable
  const isLocked = status === 'locked'

  return (
    <HStack
      justify="space-between"
      py="1.2vh"
      borderTop="1px solid rgba(119,95,116,0.14)"
      align="center"
      gap={2}
    >
      <HStack gap="6px" align="center" flex={1} minW={0}>
        <Text fontSize="clamp(14px, 4.2vw, 18px)" flexShrink={0}>
          {iconInfo.icon}
        </Text>
        <Text fontSize="clamp(13px, 3.8vw, 16px)" lineHeight="1.3" noOfLines={1}>
          <Text as="span" fontWeight="900">{label}</Text>
          {desc ? ` ${desc}` : ''}
        </Text>
      </HStack>
      {isLocked ? (
        <Text
          flexShrink={0}
          fontSize="clamp(11px, 3.3vw, 14px)"
          fontWeight="700"
          color={iconInfo.color}
        >
          {iconInfo.icon} Locked
        </Text>
      ) : (
        <StatusDropdown value={status} onChange={onStatusChange} />
      )}
    </HStack>
  )
}

export default function StaffCustomerProfile() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const phone = searchParams.get('phone') || ''
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)

  useEffect(() => {
    let cancelled = false
    getCustomer(phone)
      .then((data) => { if (!cancelled) setCustomer(data) })
      .catch(() => { if (!cancelled) setCustomer(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [phone])

  // Keep the cooldown countdown in sync and ticking every second.
  useEffect(() => {
    setCooldownRemaining(getCooldownRemaining(phone))
    const id = setInterval(() => {
      setCooldownRemaining(getCooldownRemaining(phone))
    }, 1000)
    return () => clearInterval(id)
  }, [phone])

  const name = customer?.name || 'Unknown Customer'
  const rewards = customer?.rewards || []
  const stamps = customer?.stamps || 0
  const totalStamps = TOTAL_STAMPS
  const cooling = cooldownRemaining > 0

  const handleAddStamp = useCallback(async () => {
    if (getCooldownRemaining(phone) > 0) return
    try {
      const updated = await addStamp(phone)
      setCustomer(updated)
      startCooldown(phone)
      setCooldownRemaining(getCooldownRemaining(phone))
    } catch (err) {
      console.error(err)
    }
  }, [phone])

  const handleRewardStatusChange = useCallback(async (rewardId, status) => {
    try {
      const updated = await updateRewardStatus(phone, rewardId, status)
      setCustomer(updated)
    } catch (err) {
      console.error(err)
    }
  }, [phone])

  if (loading) {
    return (
      <Layout topPadding="16vh" stackGap="1.2vh" stackPB="1vh" stackPX="6%">
        <Text textAlign="center" color="white">Loading...</Text>
      </Layout>
    )
  }

  return (
    <Layout topPadding="16vh" stackGap="1.2vh" stackPB="1vh" stackPX="6%">
      <Stack gap="1.5vh">
        <HStack justify="space-between" mb="-0.5vh">
          <Text
            as="button"
            fontSize="clamp(22px, 7vw, 30px)"
            fontWeight="700"
            color="white"
            cursor="pointer"
            bg="none"
            border="none"
            onClick={() => navigate(-1)}
            lineHeight="1"
          >
            ←
          </Text>
        </HStack>

        <GlassCard>
          <HStack justify="space-between" align="center">
            <Text fontSize="clamp(18px, 5.6vw, 24px)" fontWeight="800">
              {name}
            </Text>
            <QrButton phone={phone} />
          </HStack>
        </GlassCard>

        <GlassCard>
          <Text fontSize="clamp(16px, 5.1vw, 22px)" fontWeight="800" mb="0.8vh">
            Customer Rewards
          </Text>
          {rewards.map((reward) => (
            <StaffRewardRow
              key={reward.id}
              label={reward.title}
              desc={reward.description}
              status={reward.status}
              onStatusChange={(val) => handleRewardStatusChange(reward.id, val)}
            />
          ))}
        </GlassCard>

        <GlassCard>
          <Text fontSize="clamp(16px, 5.1vw, 22px)" fontWeight="800" mb="0.8vh">
            Collect Stamps
          </Text>
          <StampCard
            active={stamps}
            total={totalStamps}
            message="Get 1 Free Froyo at 10 Stamps"
          />
        </GlassCard>

        <Box
          as="button"
          w="clamp(180px, 55vw, 240px)"
          mx="auto"
          py="clamp(10px, 3vw, 14px)"
          borderRadius="16px"
          bg={cooling
            ? '#ccc'
            : 'linear-gradient(180deg, #ff58ae 0%, #f01b8d 100%)'}
          color="white"
          fontSize="clamp(15px, 4.5vw, 19px)"
          fontWeight="800"
          border="none"
          cursor={cooling ? 'not-allowed' : 'pointer'}
          opacity={cooling ? 0.6 : 1}
          _hover={cooling ? {} : { opacity: 0.9 }}
          _active={cooling ? {} : { transform: 'scale(0.97)' }}
          onClick={handleAddStamp}
          disabled={cooling}
        >
          {cooling ? `Next stamp in ${formatRemaining(cooldownRemaining)}` : '+ Add Stamp'}
        </Box>
        {cooling && (
          <Text textAlign="center" fontSize="clamp(11px, 3.2vw, 13px)" color="rgba(255,255,255,0.85)">
            One stamp per visit. Staff can log in again to reset.
          </Text>
        )}
      </Stack>
    </Layout>
  )
}
