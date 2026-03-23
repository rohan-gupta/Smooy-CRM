import { Stack, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { InputBox, SubmitButton, DatePickerBox } from '../components/basic'
import { useInputValue } from '../hooks/useInputValue'
import { PersonIcon, SearchIcon, MailIcon } from '../components/icons/StaffIcons'

export default function StaffEnrollMember() {
  const navigate = useNavigate()
  const fullName = useInputValue('')
  const phone = useInputValue('')
  const email = useInputValue('')
  const dob = useInputValue('')

  const handleEnroll = () => {
    const name = (fullName.value || 'New Member').trim()
    navigate(`/staff-customer-profile?name=${encodeURIComponent(name)}`)
  }

  return (
    <Layout>
      <Stack gap={5}>
        <Stack gap={2}>
          <Text fontSize="clamp(22px, 6.5vw, 30px)" fontWeight="800" textAlign="center">
            Enroll New Member
          </Text>
          <Text fontSize="clamp(13px, 3.8vw, 16px)" color="gray.600" textAlign="center">
            Register a new customer
          </Text>
        </Stack>

        <Stack gap={4}>
          <InputBox
            value={fullName.value}
            onChange={fullName.onChange}
            placeholder="Full Name"
            inputMode="text"
            withPrefix={false}
            leftIcon={<PersonIcon />}
          />

          <InputBox
            value={phone.value}
            onChange={phone.onChange}
            placeholder="Phone Number"
            inputMode="tel"
            withPrefix={true}
            prefixEmoji={null}
            prefixText="+65"
            leftIcon={<SearchIcon size={20} color="#ef69b0" />}
          />

          <InputBox
            value={email.value}
            onChange={email.onChange}
            placeholder="Email Address"
            inputMode="email"
            withPrefix={false}
            leftIcon={<MailIcon />}
          />

          <DatePickerBox
            value={dob.value}
            onChange={dob.onChange}
          />
        </Stack>

        <SubmitButton onClick={handleEnroll}>Enroll Member</SubmitButton>
      </Stack>
    </Layout>
  )
}
