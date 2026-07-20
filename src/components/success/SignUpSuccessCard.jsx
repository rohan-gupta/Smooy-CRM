import { Box, Stack, Text } from '@chakra-ui/react'
import FormCard from '../form/FormCard'
import { SubmitButton } from '../basic'

export default function SignUpSuccessCard({ onContinue }) {
  return (
    <FormCard
      title="You're all set!"
      subtitle="Your Smooy Pasir Ris Mall membership is ready to use."
      gap={4}
    >
      <Stack align="center" gap={4}>
        <Box
          w="clamp(68px, 22vw, 92px)"
          h="clamp(68px, 22vw, 92px)"
          borderRadius="999px"
          background="linear-gradient(180deg, #a9eb55 0%, #5dc839 100%)"
          display="grid"
          placeItems="center"
          boxShadow="0 12px 24px rgba(121, 197, 68, 0.28)"
        >
          <Text fontSize="clamp(34px, 11vw, 48px)" lineHeight="1" fontWeight="900" color="white">
            ✓
          </Text>
        </Box>
        <SubmitButton onClick={onContinue}>Continue</SubmitButton>
      </Stack>
    </FormCard>
  )
}
