import { Layout } from '../components/layout'
import { StaffLoginForm } from '../components/form'
import { useInputValue } from '../hooks/useInputValue'
import { useNavigate } from 'react-router-dom'

export default function StaffLogin() {
  const navigate = useNavigate()
  const staffIdOrEmail = useInputValue('')
  const password = useInputValue('')

  const handleSubmit = () => {
    navigate('/staff-home')
  }

  return (
    <Layout>
      <StaffLoginForm
        staffIdOrEmail={staffIdOrEmail.value}
        onStaffIdOrEmailChange={staffIdOrEmail.onChange}
        password={password.value}
        onPasswordChange={password.onChange}
        onSubmit={handleSubmit}
        onForgotPassword={() => {}}
      />
    </Layout>
  )
}
