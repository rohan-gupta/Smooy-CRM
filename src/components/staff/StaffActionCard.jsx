import { Box, HStack, Stack, Text } from '@chakra-ui/react'

function ActionIcon({ variant, children }) {
  const isPrimary = variant === 'primary'

  return (
    <Box
      w="clamp(40px, 12vw, 52px)"
      h="clamp(40px, 12vw, 52px)"
      borderRadius="14px"
      bg={isPrimary ? 'rgba(255,255,255,0.18)' : 'rgba(241,193,221,0.35)'}
      display="grid"
      placeItems="center"
      flexShrink={0}
    >
      {children}
    </Box>
  )
}

export default function StaffActionCard({ variant = 'primary', icon, title, subtitle, onClick }) {
  const isPrimary = variant === 'primary'

  return (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      w="full"
      borderRadius="22px"
      p="clamp(12px, 4vw, 18px)"
      border={isPrimary ? 'none' : '2.5px solid #ff1f8f'}
      background={
        isPrimary
          ? 'linear-gradient(180deg, #ff1f8f 0%, #e5007d 100%)'
          : 'rgba(255,255,255,0.74)'
      }
      color={isPrimary ? 'white' : '#dd3b90'}
      cursor="pointer"
      textAlign="left"
      boxShadow={isPrimary ? '0 10px 22px rgba(229,0,125,0.2)' : 'none'}
      _active={{ transform: 'scale(0.98)' }}
    >
      <HStack gap="14px" align="center">
        <ActionIcon variant={variant}>{icon}</ActionIcon>
        <Stack gap="2px">
          <Text fontSize="clamp(16px, 5vw, 22px)" fontWeight="800" lineHeight="1.2" color="inherit">
            {title}
          </Text>
          <Text fontSize="clamp(12px, 3.5vw, 15px)" lineHeight="1.3" color={isPrimary ? 'rgba(255,255,255,0.85)' : '#dd3b90'}>
            {subtitle}
          </Text>
        </Stack>
      </HStack>
    </Box>
  )
}
