import { HStack, Stack, Text } from '@chakra-ui/react'
import { GlassCard, QrButton, StampCard } from './RewardsComponents'
import { useRewards } from '../../context/RewardsContext'
import { REWARD_STATUS_MAP } from '../../constants/rewardStatus'

function RewardRow({ icon, label, desc, statusLabel, statusColor }) {
  return (
    <HStack
      justify="space-between"
      py="1.2vh"
      borderTop="1px solid rgba(119,95,116,0.14)"
      align="center"
    >
      <HStack gap="6px" align="center" flex={1} minW={0}>
        <Text fontSize="clamp(14px, 4.2vw, 18px)" flexShrink={0}>
          {icon}
        </Text>
        <Text fontSize="clamp(13px, 3.8vw, 16px)" lineHeight="1.3" noOfLines={1}>
          <Text as="span" fontWeight="900">{label}</Text>
          {desc ? ` ${desc}` : ''}
        </Text>
      </HStack>
      <Text
        fontSize="clamp(11px, 3.3vw, 14px)"
        fontWeight="700"
        color={statusColor}
        flexShrink={0}
      >
        {statusLabel}
      </Text>
    </HStack>
  )
}

export default function CustomerRewardsCard({ customerName = 'Sarah' }) {
  const { rewards, stamps, totalStamps } = useRewards()

  return (
    <Stack gap="1.5vh">
      <GlassCard>
        <HStack justify="space-between" align="center">
          <Text fontSize="clamp(18px, 5.6vw, 24px)" fontWeight="800">
            Welcome, {customerName}!
          </Text>
          <QrButton customerName={customerName} />
        </HStack>
      </GlassCard>

      <GlassCard>
        <Text fontSize="clamp(16px, 5.1vw, 22px)" fontWeight="800" mb="0.8vh">
          Your Rewards
        </Text>
        {rewards.map((reward) => {
          const display = REWARD_STATUS_MAP[reward.status] || REWARD_STATUS_MAP.redeemable
          return (
            <RewardRow
              key={reward.id}
              icon={display.icon}
              label={reward.label}
              desc={reward.desc}
              statusLabel={display.label}
              statusColor={display.color}
            />
          )
        })}
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
    </Stack>
  )
}
