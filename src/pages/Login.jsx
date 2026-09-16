import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Text } from '@chakra-ui/react'
import { Layout } from '../components/layout'
import { LoginForm } from '../components/form'
import { useInputValue } from '../hooks/useInputValue'
import { sendOtp } from '../api/client'

export default function Login() {
  const navigate = useNavigate()
  const phone = useInputValue('')
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    const rawPhone = phone.value.trim()
    const fullPhone = rawPhone.startsWith('+') ? rawPhone : `+65 ${rawPhone}`
    try {
      await sendOtp(fullPhone)
      navigate(`/otp?phone=${encodeURIComponent(fullPhone)}`)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Layout>
      <LoginForm
        phone={phone.value}
        onPhoneChange={phone.onChange}
        onSubmit={handleSubmit}
      />
      {error && (
        <Text color="red.400" textAlign="center" mt={2}>
          {error}
        </Text>
      )}
    </Layout>
  )
}
