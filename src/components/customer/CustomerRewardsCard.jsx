import { Box, Button, HStack, Image, Stack, Text, Grid } from '@chakra-ui/react'

function GlassCard({ children, ...props }) {
  return (
    <Box
      bg="rgba(255,245,252,0.82)"
      borderRadius="22px"
      p="3.5%"
      boxShadow="0 10px 35px rgba(178, 70, 132, 0.14)"
      border="1px solid rgba(255,255,255,0.50)"
      {...props}
    >
      {children}
    </Box>
  )
}

function RewardRow({ label, buttonLabel, buttonVariant = 'pink', onClick }) {
  const buttonStyles =
    buttonVariant === 'muted'
      ? {
          bg: '#f0dbe8',
          color: '#876e82',
          _hover: { bg: '#ead5e2' },
        }
      : {
          bg: 'linear-gradient(180deg, #ff58ae 0%, #f01b8d 100%)',
          color: 'white',
          _hover: { bg: 'linear-gradient(180deg, #e5007d 0%, #be185d 100%)' },
        }

  return (
    <HStack
      justify="space-between"
      py="1.2vh"
      borderTop="1px solid rgba(119,95,116,0.14)"
      align="center"
    >
      <Text fontSize="16px" lineHeight="1.3">
        {label}
      </Text>
      <Button
        onClick={onClick}
        minW="100px"
        height="34px"
        borderRadius="10px"
        fontSize="13px"
        fontWeight="700"
        border="none"
        flexShrink={0}
        _active={{ transform: 'scale(0.99)' }}
        {...buttonStyles}
      >
        {buttonLabel}
      </Button>
    </HStack>
  )
}

function StampDot({ filled }) {
  return (
    <Box
      w="30px"
      h="30px"
      borderRadius="999px"
      background={filled ? 'linear-gradient(180deg, #ff5cb1 0%, #ef1f8e 100%)' : 'rgba(255,255,255,0.65)'}
      border={filled ? 'none' : '2px solid #ebd7e3'}
      boxShadow={filled ? 'inset 0 2px 5px rgba(255,255,255,0.45)' : 'none'}
    />
  )
}

function StampCard({ active = 5, total = 10, message }) {
  const perRow = Math.ceil(total / 2)
  const stamps = Array.from({ length: total }, (_, i) => i)

  return (
    <Box
      bg="rgba(255,255,255,0.4)"
      borderRadius="18px"
      px="5%"
      py="3%"
      border="1px solid rgba(255,255,255,0.55)"
      w="full"
    >
      <Stack gap="6px" align="center">
        <HStack justify="center" gap="8px">
          {stamps.slice(0, perRow).map((i) => (
            <StampDot key={i} filled={i < active} />
          ))}
        </HStack>
        <HStack justify="center" gap="8px">
          {stamps.slice(perRow).map((i) => (
            <StampDot key={i} filled={i < active} />
          ))}
        </HStack>
      </Stack>

      <Text textAlign="center" mt="4px" fontSize="14px" color="#4d3f4e" fontWeight="700">
        {active} / {total} Stamps Collected
      </Text>
      <Text textAlign="center" mt="2px" fontSize="13px" color="#a33e81">
        {message}
      </Text>
    </Box>
  )
}

function QrButton({ customerName }) {
  const qrData = `Smooy-${customerName.replace(/\s+/g, '-').trim()}-QR`
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`

  return (
    <Stack
      as="button"
      type="button"
      border="none"
      background="rgba(255,255,255,0.72)"
      borderRadius="14px"
      p="6px"
      cursor="pointer"
      flexShrink={0}
      onClick={() => {}}
      align="center"
      gap="2px"
    >
      <Image
        src={src}
        alt="QR"
        width="80px"
        height="80px"
        borderRadius="8px"
        background="white"
        loading="lazy"
      />
      <Text fontSize="10px" color="#775f74" fontWeight="700">
        Scan to Earn Points
      </Text>
    </Stack>
  )
}

export default function CustomerRewardsCard({ customerName = 'Sarah' }) {
  return (
    <Stack gap="1.5vh">
      <GlassCard>
        <HStack justify="space-between" align="center">
          <Text fontSize="22px" fontWeight="800">
            Welcome, {customerName}!
          </Text>
          <QrButton customerName={customerName} />
        </HStack>
      </GlassCard>

      <GlassCard>
        <Text fontSize="20px" fontWeight="800" mb="0.8vh">
          Your Rewards
        </Text>
        <RewardRow
          label={
            <>
              <Text as="span" fontWeight="900">20% OFF</Text>{' '}
              The Next Froyo
            </>
          }
          buttonLabel="Redeem"
          buttonVariant="pink"
          onClick={() => {}}
        />
        <RewardRow
          label={
            <>
              <Text as="span" fontWeight="900">Upsize</Text>{' '}
              At 5 Stamps
            </>
          }
          buttonLabel="Redeemed"
          buttonVariant="muted"
          onClick={() => {}}
        />
      </GlassCard>

      <GlassCard>
        <Text fontSize="20px" fontWeight="800" mb="0.8vh">
          Collect Stamps
        </Text>
        <StampCard
          active={5}
          total={10}
          message="Get 1 Free Froyo at 10 Stamps"
        />
      </GlassCard>
    </Stack>
  )
}
