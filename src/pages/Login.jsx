import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { LoginForm } from '../components/form'
import { useInputValue } from '../hooks/useInputValue'

export default function Login() {
  const navigate = useNavigate()
  const phone = useInputValue('')

  const handleSubmit = () => {
    const rawPhone = phone.value.trim()
    const fullPhone = rawPhone.startsWith('+') ? rawPhone : `+65 ${rawPhone}`
    navigate(`/otp?phone=${encodeURIComponent(fullPhone)}`)
  }

  return (
    <Layout>
      <LoginForm
        phone={phone.value}
        onPhoneChange={phone.onChange}
        onSubmit={handleSubmit}
      />
    </Layout>
  )
}
