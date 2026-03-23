import { Box, Stack, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import StaffActionCard from '../components/staff/StaffActionCard'
import { QrCodeIcon, SearchIcon, PersonPlusIcon } from '../components/icons/StaffIcons'

export default function StaffHome() {
  const navigate = useNavigate()

  return (
    <Layout topPadding="clamp(140px, 22vh, 220px)" stackPB={4}>
      <Box
        bg="rgba(255,245,252,0.82)"
        borderRadius="28px"
        p={6}
        boxShadow="0 10px 35px rgba(178, 70, 132, 0.14)"
        border="1px solid rgba(255,255,255,0.50)"
      >
        <Text fontSize="clamp(17px, 5vw, 22px)" fontWeight="700" mb={5} whiteSpace="nowrap">
          Hello! What would you like to do?
        </Text>

        <Stack gap={4}>
          <StaffActionCard
            variant="primary"
            icon={<QrCodeIcon />}
            title="Scan Member QR"
            subtitle="Scan customer's QR code"
            onClick={() => navigate('/staff-qr-scanner')}
          />

          <StaffActionCard
            variant="primary"
            icon={<SearchIcon />}
            title="Search by Phone"
            subtitle="Find member by phone number"
            onClick={() => navigate('/staff-phone-search')}
          />

          <StaffActionCard
            variant="secondary"
            icon={<PersonPlusIcon />}
            title="Enroll New Member"
            subtitle="Register a new customer"
            onClick={() => navigate('/staff-enroll-member')}
          />
        </Stack>
      </Box>
    </Layout>
  )
}
