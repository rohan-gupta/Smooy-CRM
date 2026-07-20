import { Box, HStack, Image, Stack, Text } from '@chakra-ui/react'

export function GlassCard({ children, ...props }) {
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

export function StampDot({ filled }) {
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

export function StampCard({ active = 5, total = 10, message }) {
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

      <Text textAlign="center" mt="4px" fontSize="clamp(12px, 3.6vw, 15px)" color="#4d3f4e" fontWeight="700">
        {active} / {total} Stamps Collected
      </Text>
      <Text textAlign="center" mt="2px" fontSize="clamp(11px, 3.3vw, 14px)" color="#a33e81">
        {message}
      </Text>
    </Box>
  )
}

export function QrButton({ customerName }) {
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
        width="clamp(60px, 20vw, 86px)"
        height="clamp(60px, 20vw, 86px)"
        borderRadius="8px"
        background="white"
        loading="lazy"
      />
      <Text fontSize="clamp(8px, 2.6vw, 11px)" color="#775f74" fontWeight="700">
        Scan to Earn Points
      </Text>
    </Stack>
  )
}
