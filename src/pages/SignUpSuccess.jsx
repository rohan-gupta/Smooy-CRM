import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import SignUpSuccessCard from '../components/success/SignUpSuccessCard'

export default function SignUpSuccess() {
  const navigate = useNavigate()

  return (
    <Layout>
      <SignUpSuccessCard onContinue={() => navigate('/')} />
    </Layout>
  )
}

