import { useState } from 'react'
import Layout from '../components/Layout'
import StampSymbol from '../components/StampSymbol'
import { CONFIG } from '../config'
import { REWARD_TITLES_BY_STAMP, normalizeSingaporePhone } from '../utils'

function getMockRevealedStamps() {
  const s = CONFIG.MOCK_REVEALED_STAMPS
  if (Array.isArray(s)) return s
  if (typeof s === 'string') {
    return s.split(',').map((x) => Number(x.trim())).filter((n) => !isNaN(n))
  }
  return [1, 2, 3, 4, 5, 10]
}

function getMockStatusMap() {
  const m = CONFIG.MOCK_REDEMPTION_STATUS_BY_STAMP
  return m && typeof m === 'object' ? m : {}
}

function buildIssuances(revealedStamps, statusMap) {
  const map = new Map()
  for (const stamp of revealedStamps.filter((n) => n >= 1 && n <= 10)) {
    const title = REWARD_TITLES_BY_STAMP[stamp]
    if (!title) continue
    map.set(stamp, {
      stamp_number: stamp,
      reward_title: title,
      redemption_status: statusMap[stamp] || null,
    })
  }
  return map
}

function statusText(issuance, cardExpiresAt) {
  if (!issuance) return 'Locked'
  if (!issuance.redemption_status) {
    if (cardExpiresAt) {
      const t = new Date(cardExpiresAt).getTime()
      if (!isNaN(t) && Date.now() > t) return 'Expired'
    }
    return 'Available'
  }
  return issuance.redemption_status
}

export default function Customer() {
  const [view, setView] = useState('login')
  const [loginError, setLoginError] = useState('')
  const [profileError, setProfileError] = useState('')
  const [phone, setPhone] = useState(localStorage.getItem(CONFIG.LAST_PHONE_KEY) || '')
  const [customerName, setCustomerName] = useState(CONFIG.MOCK_CUSTOMER_NAME)
  const [rewardIssuances, setRewardIssuances] = useState(new Map())
  const [selectedStamp, setSelectedStamp] = useState(null)

  const cardExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

  const handleSendOtp = () => {
    try {
      const input = phone || CONFIG.MOCK_PHONE_E164 || ''
      const e164 = normalizeSingaporePhone(input)
      localStorage.setItem(CONFIG.LAST_PHONE_KEY, e164)
      setLoginError('')

      const revealed = getMockRevealedStamps()
      const statusMap = getMockStatusMap()
      setRewardIssuances(buildIssuances(revealed, statusMap))
      setCustomerName(CONFIG.MOCK_CUSTOMER_NAME)
      setView('card')
    } catch (e) {
      setLoginError(e.message || 'Invalid phone number.')
    }
  }

  const handleSaveProfile = () => {
    const name = customerName.trim()
    if (!name) {
      setProfileError('Name is required.')
      return
    }
    setProfileError('')
    setRewardIssuances(buildIssuances(getMockRevealedStamps(), getMockStatusMap()))
    setView('card')
  }

  const handleLogout = () => {
    setView('login')
    setPhone('')
    setRewardIssuances(new Map())
    setSelectedStamp(null)
  }

  const revealed = [...rewardIssuances.keys()].sort((a, b) => a - b)

  return (
    <Layout title={CONFIG.STORE_DISPLAY_NAME} subtitle="Welcome to the Smooy PRM Loyalty Club">
      {/* Login view */}
      {view === 'login' && (
        <section className="section card">
          <h2 style={{ margin: '0 0 10px 0', fontSize: 16 }}>Log in</h2>
          <div className="field">
            <label htmlFor="phoneInput">Singapore phone number (+65)</label>
            <input
              id="phoneInput"
              inputMode="tel"
              placeholder="e.g. 9876 5432"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="actions" style={{ gridTemplateColumns: '1fr' }}>
            <button type="button" className="btn btn-primary btn-small" onClick={handleSendOtp}>
              Send OTP
            </button>
          </div>
          <div className="helper">Enter your phone and click to open your loyalty card.</div>
          {loginError && (
            <div className="helper" style={{ color: 'rgba(255,93,122,0.95)' }}>
              {loginError}
            </div>
          )}
        </section>
      )}

      {/* Card view */}
      {view === 'card' && (
        <section className="section card">
          <div className="row">
            <div style={{ minWidth: 0 }}>
              <p className="subtitle">{customerName}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-ghost btn-small"
                style={{ width: 'auto', whiteSpace: 'nowrap' }}
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          </div>

          <div className="loyaltyVisualCard">
            <div className="loyaltyBgArt" aria-hidden="true" />
            <div className="loyaltyVisualContent">
              <h2 style={{ margin: '0 0 10px 0', fontSize: 16, fontWeight: 900, color: '#fff' }}>
                Your loyalty card
              </h2>
              <div className="stamps">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((stamp) => {
                  const issuance = rewardIssuances.get(stamp)
                  const isSelected = stamp === selectedStamp
                  return (
                    <div
                      key={stamp}
                      className={`stamp ${issuance ? 'revealed' : ''} ${isSelected ? 'selected' : ''}`}
                      style={{ cursor: issuance ? 'pointer' : 'default' }}
                      onClick={() => issuance && setSelectedStamp(isSelected ? null : stamp)}
                      role={issuance ? 'button' : undefined}
                    >
                      <span className="stampDoor" aria-hidden="true" />
                      <span className="stampSymbol">
                        <StampSymbol stamp={stamp} />
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="section" style={{ marginTop: 14 }}>
                {revealed.length > 0 && (
                  <div className="pill neutral" style={{ display: 'inline-flex' }}>
                    Tap a revealed stamp to view details
                  </div>
                )}

                {selectedStamp && rewardIssuances.has(selectedStamp) && (
                  <div className="item" style={{ display: 'block', marginTop: 10 }}>
                    <div className="itemTitle">
                      {selectedStamp}) {rewardIssuances.get(selectedStamp).reward_title}
                    </div>
                    <p className="itemSub">
                      Status: {statusText(rewardIssuances.get(selectedStamp), cardExpiresAt)}
                      <br />
                      Valid until: {new Date(cardExpiresAt).toLocaleDateString()}
                    </p>
                    <div className="helper" style={{ marginTop: 10 }}>
                      Show this screen to staff to get your reward.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  )
}
