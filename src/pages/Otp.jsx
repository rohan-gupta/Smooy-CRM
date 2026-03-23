import { useNavigate, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/layout'
import { OtpForm } from '../components/form'
import { useInputValue } from '../hooks/useInputValue'
import { useCountdown } from '../hooks/useCountdown'

export default function Otp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const phone = searchParams.get('phone') || '+65 XXXX XXXX'
  const code = useInputValue('')
  const countdown = useCountdown(60)

  const handleSubmit = () => {
    navigate('/signup-success')
  }

  return (
    <Layout>
      <OtpForm
        phone={phone}
        code={code.value}
        onCodeChange={code.onChange}
        onSubmit={handleSubmit}
        onResend={countdown.reset}
        countdown={countdown.formatted}
      />
    </Layout>
  )
}
