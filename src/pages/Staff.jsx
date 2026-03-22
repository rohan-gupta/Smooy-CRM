import { useState } from 'react'
import Layout from '../components/Layout'
import { CONFIG } from '../config'
import { REWARD_TITLES_BY_STAMP, normalizeSingaporePhone } from '../utils'

function buildIssuances(mockRevealedStamps, mockStatusMap) {
  const map = new Map()
  const revealed = [...mockRevealedStamps].sort((a, b) => a - b)
  for (const stamp of revealed) {
    const title = REWARD_TITLES_BY_STAMP[stamp] || 'Reward'
    map.set(stamp, {
      stamp_number: stamp,
      reward_title: title,
      redemption_status: mockStatusMap[stamp] || null,
    })
  }
  return map
}

function statusText(issuance) {
  if (!issuance) return 'Locked'
  if (!issuance.redemption_status) return 'Available'
  return issuance.redemption_status
}

export default function Staff() {
  const [view, setView] = useState('login')
  const [loginError, setLoginError] = useState('')
  const [searchError, setSearchError] = useState('')
  const [grantError, setGrantError] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [customerProfile, setCustomerProfile] = useState(null)
  const [mockRevealedStamps, setMockRevealedStamps] = useState(
    Array.isArray(CONFIG.MOCK_REVEALED_STAMPS) ? CONFIG.MOCK_REVEALED_STAMPS : [1, 2, 3, 4, 5]
  )
  const [mockStatusMap, setMockStatusMap] = useState(
    CONFIG.MOCK_REDEMPTION_STATUS_BY_STAMP && typeof CONFIG.MOCK_REDEMPTION_STATUS_BY_STAMP === 'object'
      ? CONFIG.MOCK_REDEMPTION_STATUS_BY_STAMP
      : {}
  )

  const rewardIssuances = buildIssuances(mockRevealedStamps, mockStatusMap)
  const revealed = [...rewardIssuances.keys()].sort((a, b) => a - b)
  const maxStamp = revealed.length ? Math.max(...revealed) : 0

  const handleLogin = () => {
    setLoginError('')
    setView('main')
  }

  const handleSearchCustomer = () => {
    setSearchError('')
    setGrantError('')
    if (!phoneInput.trim()) {
      setSearchError('Enter a customer phone number.')
      return
    }
    try {
      const phoneE164 = normalizeSingaporePhone(phoneInput)
      setCustomerProfile({
        name: CONFIG.MOCK_CUSTOMER_NAME || 'Test Customer',
        phone_e164: phoneE164,
      })
    } catch (e) {
      setSearchError(e.message || 'Search failed.')
    }
  }

  const handleClearCustomer = () => {
    setCustomerProfile(null)
    setPhoneInput('')
  }

  const handleGrantStamp = () => {
    if (!customerProfile) return
    setGrantError('')

    const nextStamp = maxStamp + 1
    if (nextStamp > 10) return
    if (!revealed.length && nextStamp !== 1) return
    if (revealed.length && maxStamp !== revealed.length) {
      setGrantError('Stamps must be granted sequentially.')
      return
    }

    setMockRevealedStamps([...new Set([...mockRevealedStamps, nextStamp])].sort((a, b) => a - b))
  }

  const handleRedeemStamp = (status, stampNumber) => {
    if (!customerProfile) return
    if (!rewardIssuances.has(stampNumber)) return
    if (status !== 'Redeemed' && status !== 'Expired') return
    setGrantError('')
    setMockStatusMap({ ...mockStatusMap, [stampNumber]: status })
  }

  const handleLogout = () => {
    setView('login')
    setCustomerProfile(null)
    setPhoneInput('')
  }

  return (
    <Layout title={CONFIG.STORE_DISPLAY_NAME} subtitle="Welcome to the Smooy PRM Loyalty Club">
      {/* Login view */}
      {view === 'login' && (
        <section className="section card">
          <h2 style={{ margin: '0 0 10px 0', fontSize: 16 }}>Staff login</h2>
          <div className="field">
            <label htmlFor="emailInput">Email</label>
            <input id="emailInput" type="email" placeholder="staff@email.com" />
          </div>
          <div className="field">
            <label htmlFor="passwordInput">Password</label>
            <input id="passwordInput" type="password" placeholder="••••••••" />
          </div>
          <div className="actions" style={{ gridTemplateColumns: '1fr' }}>
            <button type="button" className="btn btn-primary btn-small" onClick={handleLogin}>
              Log in
            </button>
          </div>
          {loginError && (
            <div className="helper" style={{ color: 'rgba(255,93,122,0.95)' }}>
              {loginError}
            </div>
          )}
        </section>
      )}

      {/* Main view */}
      {view === 'main' && (
        <section className="section card">
          <div className="row" style={{ alignItems: 'center' }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: 16 }}>Store</h2>
              <p className="subtitle" style={{ marginTop: 6 }}>{CONFIG.STORE_DISPLAY_NAME}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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

          <div className="section">
            <h3 style={{ margin: '14px 0 8px 0', fontSize: 14 }}>Find customer</h3>
            <div className="field">
              <label htmlFor="staffPhoneInput">Customer phone (Singapore)</label>
              <input
                id="staffPhoneInput"
                inputMode="tel"
                placeholder="e.g. 9781 3023"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
              />
            </div>
            <div className="actions" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <button type="button" className="btn btn-primary btn-small" onClick={handleSearchCustomer}>
                Search
              </button>
              <button type="button" className="btn btn-ghost btn-small" onClick={handleClearCustomer}>
                Clear
              </button>
            </div>
            {searchError && (
              <div className="helper" style={{ color: 'rgba(255,93,122,0.95)' }}>{searchError}</div>
            )}
          </div>

          {customerProfile && (
            <div>
              <div className="item" style={{ marginTop: 12 }}>
                <div className="itemTitle">{customerProfile.name}</div>
                <p className="itemSub">{customerProfile.phone_e164}</p>
              </div>

              <div className="actions" style={{ gridTemplateColumns: '1fr' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-small"
                  onClick={handleGrantStamp}
                  disabled={maxStamp >= 10}
                >
                  {maxStamp >= 10 ? 'Card complete' : 'Grant next stamp'}
                </button>
              </div>
              {grantError && (
                <div className="helper" style={{ color: 'rgba(255,93,122,0.95)' }}>{grantError}</div>
              )}

              <div className="section">
                <h3 style={{ margin: '14px 0 8px 0', fontSize: 14 }}>Card</h3>
                <div className="stamps">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((stamp) => {
                    const issuance = rewardIssuances.get(stamp)
                    return (
                      <div
                        key={stamp}
                        className={`stamp ${issuance ? 'revealed' : ''} ${issuance?.redemption_status === 'Redeemed' ? 'redeemed' : ''} ${issuance?.redemption_status === 'Expired' ? 'expired' : ''}`}
                      >
                        {stamp}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="section">
                <h3 style={{ margin: '14px 0 8px 0', fontSize: 14 }}>Redeem / expire</h3>
                <div className="list" style={{ marginTop: 0 }}>
                  {revealed.length === 0 ? (
                    <div className="helper">No stamps yet for this customer.</div>
                  ) : (
                    revealed.map((stamp) => {
                      const issuance = rewardIssuances.get(stamp)
                      const status = issuance.redemption_status
                      return (
                        <div key={stamp} className="item">
                          <div className="itemTitle">
                            {stamp}) {issuance.reward_title}
                          </div>
                          <p className="itemSub">
                            Status:{' '}
                            {status === 'Redeemed' ? (
                              <span className="pill success">Redeemed</span>
                            ) : status === 'Expired' ? (
                              <span className="pill danger">Expired</span>
                            ) : (
                              <span className="pill neutral">Available</span>
                            )}
                          </p>
                          {!status && (
                            <div className="actions" style={{ gridTemplateColumns: '1fr 1fr' }}>
                              <button
                                type="button"
                                className="btn btn-success btn-small"
                                onClick={() => handleRedeemStamp('Redeemed', stamp)}
                              >
                                Mark Redeemed
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-small"
                                onClick={() => handleRedeemStamp('Expired', stamp)}
                              >
                                Mark Expired
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </Layout>
  )
}
