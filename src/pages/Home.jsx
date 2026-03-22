import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { CONFIG } from '../config'

export default function Home() {
  return (
    <Layout
      title="Smooy Pasir Ris Mall"
      subtitle="Welcome to the Smooy PRM Loyalty Club"
    >
      <section className="grid">
        <Link className="btn btn-primary" to="/customer">
          Customer loyalty card
        </Link>
        <Link className="btn btn-ghost" to="/staff">
          Staff portal
        </Link>
      </section>
      <footer className="fineprint">
        Built for phone-first use. Staff actions are gated to staff auth accounts.
      </footer>
    </Layout>
  )
}
