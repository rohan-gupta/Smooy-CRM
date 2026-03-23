import { useState, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { Layout } from '../components/layout'
import { GlassCard, QrButton, StampCard } from '../components/customer/RewardsComponents'
import { useRewards } from '../context/RewardsContext'
import { REWARD_STATUSES, REWARD_STATUS_MAP } from '../constants/rewardStatus'

function StatusDropdown({ value, onChange }) {
  const current = REWARD_STATUS_MAP[value] || REWARD_STATUSES[0]

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
        {REWARD_STATUSES.map((opt) => (
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
      <StatusDropdown value={status} onChange={onStatusChange} />
    </HStack>
  )
}

export default function StaffCustomerProfile() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const name = searchParams.get('name') || 'Sarah Miller'
  const { rewards, stamps, totalStamps, updateRewardStatus, addStamp } = useRewards()
  const [stampLocked, setStampLocked] = useState(false)
  const lockTimer = useRef(null)

  const handleAddStamp = useCallback(() => {
    if (stampLocked) return
    addStamp()
    setStampLocked(true)
    lockTimer.current = setTimeout(() => setStampLocked(false), 3000)
  }, [stampLocked, addStamp])

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
            <QrButton customerName={name} />
          </HStack>
        </GlassCard>

        <GlassCard>
          <Text fontSize="clamp(16px, 5.1vw, 22px)" fontWeight="800" mb="0.8vh">
            Customer Rewards
          </Text>
          {rewards.map((reward) => (
            <StaffRewardRow
              key={reward.id}
              label={reward.label}
              desc={reward.desc}
              status={reward.status}
              onStatusChange={(val) => updateRewardStatus(reward.id, val)}
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
          bg={stampLocked
            ? '#ccc'
            : 'linear-gradient(180deg, #ff58ae 0%, #f01b8d 100%)'}
          color="white"
          fontSize="clamp(15px, 4.5vw, 19px)"
          fontWeight="800"
          border="none"
          cursor={stampLocked ? 'not-allowed' : 'pointer'}
          opacity={stampLocked ? 0.6 : 1}
          _hover={stampLocked ? {} : { opacity: 0.9 }}
          _active={stampLocked ? {} : { transform: 'scale(0.97)' }}
          onClick={handleAddStamp}
        >
          {stampLocked ? 'Stamp Added ✓' : '+ Add Stamp'}
        </Box>
      </Stack>
    </Layout>
  )
}
