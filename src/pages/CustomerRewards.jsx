import { useSearchParams } from 'react-router-dom'
import { Layout } from '../components/layout'
import CustomerRewardsCard from '../components/customer/CustomerRewardsCard'

export default function CustomerRewards() {
  const [searchParams] = useSearchParams()
  const name = searchParams.get('name') || 'Sarah'

  return (
    <Layout topPadding="16vh" stackGap="1.2vh" stackPB="1vh" stackPX="6%">
      <CustomerRewardsCard customerName={name} />
    </Layout>
  )
}

