import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Text } from '@chakra-ui/react'
import { Layout } from '../components/layout'
import { OtpForm } from '../components/form'
import { useInputValue } from '../hooks/useInputValue'
import { useCountdown } from '../hooks/useCountdown'
import { CUSTOMER_SESSION_KEY } from '../components/auth/RequireAuth'
import { getCustomer, verifyOtp, sendOtp } from '../api/client'

export default function Otp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const phone = searchParams.get('phone') || '+65 XXXX XXXX'
  const code = useInputValue('')
  const countdown = useCountdown(60)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    try {
      await verifyOtp(phone, code.value)
    } catch (err) {
      setError(err.message)
      return
    }

    sessionStorage.setItem(CUSTOMER_SESSION_KEY, phone)
    try {
      await getCustomer(phone)
      navigate(`/customer-rewards?phone=${encodeURIComponent(phone)}`)
    } catch (err) {
      if (err.status === 404) {
        navigate(`/signup?phone=${encodeURIComponent(phone)}`)
      } else {
        setError(err.message)
      }
    }
  }

  const handleResend = async () => {
    try {
      await sendOtp(phone)
      countdown.reset()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Layout>
      <OtpForm
        phone={phone}
        code={code.value}
        onCodeChange={code.onChange}
        onSubmit={handleSubmit}
        onResend={handleResend}
        countdown={countdown.formatted}
      />
      {error && (
        <Text color="red.400" textAlign="center" mt={2}>
          {error}
        </Text>
      )}
    </Layout>
  )
}
