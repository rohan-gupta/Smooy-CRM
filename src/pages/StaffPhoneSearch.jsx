import { Box, Stack, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { InputBox, SubmitButton } from '../components/basic'
import { useInputValue } from '../hooks/useInputValue'

export default function StaffPhoneSearch() {
  const navigate = useNavigate()
  const phone = useInputValue('')

  const handleSearch = () => {
    // Simulated lookup -- replace with real API call when backend is ready
    const customerName = 'Sarah Miller'
    navigate(`/staff-customer-profile?name=${encodeURIComponent(customerName)}`)
  }

  return (
    <Layout>
      <Stack gap={5}>
        <Stack gap={2}>
          <Text fontSize="clamp(22px, 6.5vw, 30px)" fontWeight="800" textAlign="center">
            Search by Phone
          </Text>
          <Text fontSize="clamp(13px, 3.8vw, 16px)" color="gray.600" textAlign="center">
            Enter customer's phone number
          </Text>
        </Stack>

        <InputBox
          value={phone.value}
          onChange={phone.onChange}
          placeholder="Phone number"
          inputMode="tel"
          withPrefix={true}
          prefixEmoji="🔍"
          prefixText="+65"
        />

        <SubmitButton onClick={handleSearch}>Search</SubmitButton>

        <Box textAlign="center">
          <Text
            as="button"
            fontSize="clamp(14px, 4.2vw, 18px)"
            fontWeight="600"
            color="#d9368b"
            textDecoration="underline"
            cursor="pointer"
            onClick={() => navigate('/staff-qr-scanner')}
          >
            Scan QR Instead
          </Text>
        </Box>
      </Stack>
    </Layout>
  )
}
