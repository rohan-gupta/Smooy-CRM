import {
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Heading,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import Layout from '../components/Layout';
import { CONFIG } from '../config';
import { REWARD_TITLES_BY_STAMP, normalizeSingaporePhone } from '../utils';

function buildIssuances(mockRevealedStamps, mockStatusMap) {
  const map = new Map();
  const revealed = [...mockRevealedStamps].sort((a, b) => a - b);
  for (const stamp of revealed) {
    const title = REWARD_TITLES_BY_STAMP[stamp] || 'Reward';
    map.set(stamp, {
      stamp_number: stamp,
      reward_title: title,
      redemption_status: mockStatusMap[stamp] || null,
    });
  }
  return map;
}

function statusText(issuance) {
  if (!issuance) return 'Locked';
  if (!issuance.redemption_status) return 'Available';
  return issuance.redemption_status;
}

export default function Staff() {
  const [view, setView] = useState('login');
  const [loginError, setLoginError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [grantError, setGrantError] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [customerProfile, setCustomerProfile] = useState(null);
  const [mockRevealedStamps, setMockRevealedStamps] = useState(
    Array.isArray(CONFIG.MOCK_REVEALED_STAMPS) ? CONFIG.MOCK_REVEALED_STAMPS : [1, 2, 3, 4, 5]
  );
  const [mockStatusMap, setMockStatusMap] = useState(
    CONFIG.MOCK_REDEMPTION_STATUS_BY_STAMP && typeof CONFIG.MOCK_REDEMPTION_STATUS_BY_STAMP === 'object'
      ? CONFIG.MOCK_REDEMPTION_STATUS_BY_STAMP
      : {}
  );

  const rewardIssuances = buildIssuances(mockRevealedStamps, mockStatusMap);
  const revealed = [...rewardIssuances.keys()].sort((a, b) => a - b);
  const maxStamp = revealed.length ? Math.max(...revealed) : 0;

  const handleLogin = () => {
    setLoginError('');
    setView('main');
  };

  const handleSearchCustomer = () => {
    setSearchError('');
    setGrantError('');
    if (!phoneInput.trim()) {
      setSearchError('Enter a customer phone number.');
      return;
    }
    try {
      const phoneE164 = normalizeSingaporePhone(phoneInput);
      setCustomerProfile({
        name: CONFIG.MOCK_CUSTOMER_NAME || 'Test Customer',
        phone_e164: phoneE164,
      });
    } catch (e) {
      setSearchError(e.message || 'Search failed.');
    }
  };

  const handleClearCustomer = () => {
    setCustomerProfile(null);
    setPhoneInput('');
  };

  const handleGrantStamp = () => {
    if (!customerProfile) return;
    setGrantError('');

    const nextStamp = maxStamp + 1;
    if (nextStamp > 10) return;
    if (!revealed.length && nextStamp !== 1) return;
    if (revealed.length && maxStamp !== revealed.length) {
      setGrantError('Stamps must be granted sequentially.');
      return;
    }

    setMockRevealedStamps([...new Set([...mockRevealedStamps, nextStamp])].sort((a, b) => a - b));
  };

  const handleRedeemStamp = (status, stampNumber) => {
    if (!customerProfile) return;
    if (!rewardIssuances.has(stampNumber)) return;
    if (status !== 'Redeemed' && status !== 'Expired') return;
    setGrantError('');
    setMockStatusMap({ ...mockStatusMap, [stampNumber]: status });
  };

  const handleLogout = () => {
    setView('login');
    setCustomerProfile(null);
    setPhoneInput('');
  };

  return (
    <Layout title={CONFIG.STORE_DISPLAY_NAME} subtitle="Welcome to the Smooy PRM Loyalty Club">
      {view === 'login' && (
        <Card.Root>
          <Card.Body>
            <Stack gap={4}>
              <Heading as="h2" size="md">
                Staff login
              </Heading>
              <Stack gap={2}>
                <Text as="label" htmlFor="emailInput" fontSize="sm" color="gray.600">
                  Email
                </Text>
                <Input id="emailInput" type="email" placeholder="staff@email.com" />
              </Stack>
              <Stack gap={2}>
                <Text as="label" htmlFor="passwordInput" fontSize="sm" color="gray.600">
                  Password
                </Text>
                <Input id="passwordInput" type="password" placeholder="••••••••" />
              </Stack>
              <Button type="button" colorPalette="pink" onClick={handleLogin}>
                Log in
              </Button>
              {loginError && (
                <Text fontSize="sm" color="red.500">
                  {loginError}
                </Text>
              )}
            </Stack>
          </Card.Body>
        </Card.Root>
      )}

      {view === 'main' && (
        <Card.Root>
          <Card.Body>
            <Stack gap={5}>
              <Box display="flex" justifyContent="space-between" alignItems="center" gap={3}>
                <Box>
                  <Heading as="h2" size="sm">
                    Store
                  </Heading>
                  <Text color="gray.600" mt={1}>
                    {CONFIG.STORE_DISPLAY_NAME}
                  </Text>
                </Box>
                <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </Box>

              <Stack gap={3}>
                <Heading as="h3" size="sm">
                  Find customer
                </Heading>
                <Stack gap={2}>
                  <Text as="label" htmlFor="staffPhoneInput" fontSize="sm" color="gray.600">
                    Customer phone (Singapore)
                  </Text>
                  <Input
                    id="staffPhoneInput"
                    inputMode="tel"
                    placeholder="e.g. 9781 3023"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                  />
                </Stack>
                <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                  <Button type="button" colorPalette="pink" onClick={handleSearchCustomer}>
                    Search
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClearCustomer}>
                    Clear
                  </Button>
                </Grid>
                {searchError && (
                  <Text fontSize="sm" color="red.500">
                    {searchError}
                  </Text>
                )}
              </Stack>

              {customerProfile && (
                <Stack gap={4}>
                  <Box p={3} borderWidth="1px" borderRadius="md">
                    <Text fontWeight="semibold">{customerProfile.name}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {customerProfile.phone_e164}
                    </Text>
                  </Box>

                  <Button type="button" colorPalette="pink" onClick={handleGrantStamp} disabled={maxStamp >= 10}>
                    {maxStamp >= 10 ? 'Card complete' : 'Grant next stamp'}
                  </Button>
                  {grantError && (
                    <Text fontSize="sm" color="red.500">
                      {grantError}
                    </Text>
                  )}

                  <Stack gap={2}>
                    <Heading as="h3" size="sm">
                      Card
                    </Heading>
                    <Grid templateColumns="repeat(5, 1fr)" gap={2}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((stamp) => {
                        const issuance = rewardIssuances.get(stamp);
                        const status = statusText(issuance);
                        const palette = status === 'Redeemed' ? 'green' : status === 'Expired' ? 'red' : issuance ? 'pink' : 'gray';

                        return (
                          <Box
                            key={stamp}
                            borderWidth="1px"
                            borderRadius="full"
                            minH="40px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            colorPalette={palette}
                            bg={issuance ? `${palette}.50` : 'transparent'}
                          >
                            <Text fontWeight="semibold">{stamp}</Text>
                          </Box>
                        );
                      })}
                    </Grid>
                  </Stack>

                  <Stack gap={2}>
                    <Heading as="h3" size="sm">
                      Redeem / expire
                    </Heading>
                    {revealed.length === 0 ? (
                      <Text fontSize="sm" color="gray.600">
                        No stamps yet for this customer.
                      </Text>
                    ) : (
                      revealed.map((stamp) => {
                        const issuance = rewardIssuances.get(stamp);
                        const status = issuance.redemption_status;
                        const badgePalette =
                          status === 'Redeemed' ? 'green' : status === 'Expired' ? 'red' : 'gray';

                        return (
                          <Box key={stamp} p={3} borderWidth="1px" borderRadius="md">
                            <Text fontWeight="semibold">
                              {stamp}) {issuance.reward_title}
                            </Text>
                            <Text fontSize="sm" color="gray.700" mt={1}>
                              Status: <Badge colorPalette={badgePalette}>{statusText(issuance)}</Badge>
                            </Text>
                            {!status && (
                              <Grid templateColumns="repeat(2, 1fr)" gap={2} mt={3}>
                                <Button
                                  type="button"
                                  colorPalette="green"
                                  onClick={() => handleRedeemStamp('Redeemed', stamp)}
                                >
                                  Mark Redeemed
                                </Button>
                                <Button
                                  type="button"
                                  colorPalette="red"
                                  onClick={() => handleRedeemStamp('Expired', stamp)}
                                >
                                  Mark Expired
                                </Button>
                              </Grid>
                            )}
                          </Box>
                        );
                      })
                    )}
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Card.Body>
        </Card.Root>
      )}
    </Layout>
  );
}
