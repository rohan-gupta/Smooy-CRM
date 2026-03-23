import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { SignUpForm } from '../components/form'
import { useInputValue } from '../hooks/useInputValue'

export default function Signup() {
  const navigate = useNavigate()
  const name = useInputValue('')
  const email = useInputValue('')
  const dob = useInputValue('')

  const handleSubmit = () => {
    const customerName = (name.value || 'Sarah').trim()
    navigate(`/signup-success?name=${encodeURIComponent(customerName)}`)
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
