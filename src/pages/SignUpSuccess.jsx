import { useNavigate, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/layout'
import SignUpSuccessCard from '../components/success/SignUpSuccessCard'

export default function SignUpSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const name = searchParams.get('name') || 'Sarah'

  return (
    <Layout>
      <SignUpSuccessCard onContinue={() => navigate(`/customer-rewards?name=${encodeURIComponent(name)}`)} />
    </Layout>
  )
}

