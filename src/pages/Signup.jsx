import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Text } from '@chakra-ui/react'
import { Layout } from '../components/layout'
import { SignUpForm } from '../components/form'
import { useInputValue } from '../hooks/useInputValue'
import { enrollCustomer } from '../api/client'

export default function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const phone = searchParams.get('phone') || ''
  const name = useInputValue('')
  const email = useInputValue('')
  const dob = useInputValue('')
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    const trimmedName = name.value.trim() || 'New Member'
    try {
      await enrollCustomer(phone, trimmedName, email.value.trim(), dob.value)
      navigate(`/signup-success?name=${encodeURIComponent(trimmedName)}&phone=${encodeURIComponent(phone)}`)
    } catch (err) {
      setError(err.message)
    }
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
      {error && (
        <Text color="red.400" textAlign="center" mt={2}>
          {error}
        </Text>
      )}
    </Layout>
  )
}
