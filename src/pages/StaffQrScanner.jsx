import { Box, Stack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { SubmitButton } from '../components/basic'
import QrScanner from '../components/staff/QrScanner'

export default function StaffQrScanner() {
  const navigate = useNavigate()

  const handleScanSuccess = (decodedText) => {
    navigate(`/staff-customer-profile?name=${encodeURIComponent(decodedText)}`)
  }

  return (
    <Layout topPadding="clamp(120px, 18vh, 180px)" stackPB={6}>
      <Stack gap={6} align="center" px="6%">
        <QrScanner onScanSuccess={handleScanSuccess} />
      </Stack>

      <Box position="fixed" bottom="clamp(24px, 5vh, 40px)" left="0" right="0" display="flex" justifyContent="center" px="6%">
        <SubmitButton
          w="clamp(180px, 55vw, 240px)"
          h="clamp(38px, 11vw, 48px)"
          fontSize="clamp(14px, 4.2vw, 17px)"
          onClick={() => navigate('/staff-phone-search')}
        >
          Enter Phone Instead
        </SubmitButton>
      </Box>
    </Layout>
  )
}
