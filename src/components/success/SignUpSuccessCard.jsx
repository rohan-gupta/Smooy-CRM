import { Box, Stack, Text } from '@chakra-ui/react'
import { SubmitButton } from '../basic'

export default function SignUpSuccessCard({ onContinue }) {
  return (
    <Box
      w="full"
      bg="rgba(255,245,252,0.82)"
      borderRadius="28px"
      p={6}
      boxShadow="0 10px 35px rgba(178, 70, 132, 0.14)"
      border="1px solid rgba(255,255,255,0.50)"
    >
      <Stack gap={4} align="center">
        <Box
          w="88px"
          h="88px"
          borderRadius="999px"
          background="linear-gradient(180deg, #a9eb55 0%, #5dc839 100%)"
          display="grid"
          placeItems="center"
          boxShadow="0 12px 24px rgba(121, 197, 68, 0.28)"
        >
          <Text fontSize="44px" lineHeight="1" fontWeight="900" color="white">
            ✓
          </Text>
        </Box>

        <Text fontSize="28px" fontWeight="800" color="#ca2b7d" textAlign="center">
          You're all set!
        </Text>

        <Text fontSize="18px" color="#4d3f4e" textAlign="center" lineHeight="1.45">
          Your Smooy Pasir Ris Mall membership is ready to use.
        </Text>

        <SubmitButton onClick={onContinue}>Continue</SubmitButton>
      </Stack>
    </Box>
  )
}

