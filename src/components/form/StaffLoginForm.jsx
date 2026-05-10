import { Box, Stack, Text } from '@chakra-ui/react'
import FormCard from './FormCard'
import { InputBox, SubmitButton } from '../basic'

export default function StaffLoginForm({
  staffIdOrEmail,
  onStaffIdOrEmailChange,
  password,
  onPasswordChange,
  onSubmit,
  onForgotPassword,
}) {
  return (
    <FormCard title="Staff Login" subtitle={null} gap={4}>
      <Stack gap={4}>
        <Stack gap={2}>
          <Text fontSize="sm" fontWeight="600" color="gray.700">
            Staff ID or Email
          </Text>
          <InputBox
            value={staffIdOrEmail}
            onChange={onStaffIdOrEmailChange}
            placeholder="staff@smooy.com"
            withPrefix={false}
          />
        </Stack>

        <Stack gap={2}>
          <Text fontSize="sm" fontWeight="600" color="gray.700">
            Password
          </Text>
          <InputBox
            value={password}
            onChange={onPasswordChange}
            placeholder="Enter password"
            type="password"
            withPrefix={false}
          />
        </Stack>

        <SubmitButton onClick={onSubmit}>Log In</SubmitButton>

        <Box textAlign="center">
          <Text
            as="button"
            fontSize="sm"
            color="gray.500"
            fontWeight="600"
            onClick={onForgotPassword}
            cursor="pointer"
          >
            Forgot password?
          </Text>
        </Box>
      </Stack>
    </FormCard>
  )
}

