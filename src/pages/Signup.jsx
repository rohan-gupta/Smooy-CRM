import { useNavigate, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/layout'
import { SignUpForm } from '../components/form'
import { useInputValue } from '../hooks/useInputValue'

export default function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const phone = searchParams.get('phone') || ''
  const name = useInputValue('')
  const email = useInputValue('')
  const dob = useInputValue('')

  const handleSubmit = () => {
    // TODO: POST /customers with { phone, name, email, dob }
    navigate(`/signup-success?name=${encodeURIComponent(name.value.trim())}`)
  }

  return (
    <Layout>
      <SignUpForm
        name={name.value}
        onNameChange={name.onChange}
        email={email.value}
        onEmailChange={email.onChange}
        dob={dob.value}
        onDobChange={dob.onChange}
        onSubmit={handleSubmit}
      />
    </Layout>
  )
}
