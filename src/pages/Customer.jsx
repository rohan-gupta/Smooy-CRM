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
import StampSymbol from '../components/StampSymbol';
import { CONFIG } from '../config';
import { REWARD_TITLES_BY_STAMP, normalizeSingaporePhone } from '../utils';

function getMockRevealedStamps() {
  const s = CONFIG.MOCK_REVEALED_STAMPS;
  if (Array.isArray(s)) return s;
  if (typeof s === 'string') {
    return s
      .split(',')
      .map((x) => Number(x.trim()))
      .filter((n) => !isNaN(n));
  }
  return [1, 2, 3, 4, 5, 10];
}

function getMockStatusMap() {
  const m = CONFIG.MOCK_REDEMPTION_STATUS_BY_STAMP;
  return m && typeof m === 'object' ? m : {};
}

function buildIssuances(revealedStamps, statusMap) {
  const map = new Map();
  for (const stamp of revealedStamps.filter((n) => n >= 1 && n <= 10)) {
    const title = REWARD_TITLES_BY_STAMP[stamp];
    if (!title) continue;
    map.set(stamp, {
      stamp_number: stamp,
      reward_title: title,
      redemption_status: statusMap[stamp] || null,
    });
  }
  return map;
}

function statusText(issuance, cardExpiresAt) {
  if (!issuance) return 'Locked';
  if (!issuance.redemption_status) {
    if (cardExpiresAt) {
      const t = new Date(cardExpiresAt).getTime();
      if (!isNaN(t) && Date.now() > t) return 'Expired';
    }
    return 'Available';
  }
  return issuance.redemption_status;
}

export default function Customer() {
  const [view, setView] = useState('login');
  const [loginError, setLoginError] = useState('');
  const [phone, setPhone] = useState(localStorage.getItem(CONFIG.LAST_PHONE_KEY) || '');
  const [customerName, setCustomerName] = useState(CONFIG.MOCK_CUSTOMER_NAME);
  const [rewardIssuances, setRewardIssuances] = useState(new Map());
  const [selectedStamp, setSelectedStamp] = useState(null);

  const cardExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const handleSendOtp = () => {
    try {
      const input = phone || CONFIG.MOCK_PHONE_E164 || '';
      const e164 = normalizeSingaporePhone(input);
      localStorage.setItem(CONFIG.LAST_PHONE_KEY, e164);
      setLoginError('');

      const revealed = getMockRevealedStamps();
      const statusMap = getMockStatusMap();
      setRewardIssuances(buildIssuances(revealed, statusMap));
      setCustomerName(CONFIG.MOCK_CUSTOMER_NAME);
      setView('card');
    } catch (e) {
      setLoginError(e.message || 'Invalid phone number.');
    }
  };

  const handleLogout = () => {
    setView('login');
    setPhone('');
    setRewardIssuances(new Map());
    setSelectedStamp(null);
  };

  const revealed = [...rewardIssuances.keys()].sort((a, b) => a - b);

  return (
    <Layout title={CONFIG.STORE_DISPLAY_NAME} subtitle="Welcome to the Smooy PRM Loyalty Club">
      {view === 'login' && (
        <Card.Root>
          <Card.Body>
            <Stack gap={4}>
              <Heading as="h2" size="md">
                Log in
              </Heading>
              <Stack gap={2}>
                <Text as="label" htmlFor="phoneInput" fontSize="sm" color="gray.600">
                  Singapore phone number (+65)
                </Text>
                <Input
                  id="phoneInput"
                  inputMode="tel"
                  placeholder="e.g. 9876 5432"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Stack>
              <Button type="button" colorPalette="pink" onClick={handleSendOtp}>
                Send OTP
              </Button>
              <Text fontSize="sm" color="gray.600">
                Enter your phone and click to open your loyalty card.
              </Text>
              {loginError && (
                <Text fontSize="sm" color="red.500">
                  {loginError}
                </Text>
              )}
            </Stack>
          </Card.Body>
        </Card.Root>
      )}

      {view === 'card' && (
        <Card.Root>
          <Card.Body>
            <Stack gap={4}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={3}>
                <Text color="gray.600">{customerName}</Text>
                <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </Box>

              <Box bg="pink.500" borderRadius="lg" p={4}>
                <Heading as="h2" size="sm" color="white" mb={3}>
                  Your loyalty card
                </Heading>
                <Grid templateColumns="repeat(5, 1fr)" gap={2}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((stamp) => {
                    const issuance = rewardIssuances.get(stamp);
                    const isSelected = stamp === selectedStamp;
                    const isClickable = Boolean(issuance);

                    return (
                      <Button
                        key={stamp}
                        type="button"
                        onClick={() => isClickable && setSelectedStamp(isSelected ? null : stamp)}
                        variant={issuance ? 'solid' : 'outline'}
                        colorPalette={issuance ? 'pink' : 'gray'}
                        opacity={issuance ? 1 : 0.6}
                        cursor={isClickable ? 'pointer' : 'not-allowed'}
                        minH="48px"
                        p={0}
                        borderWidth={isSelected ? '2px' : '1px'}
                        borderColor={isSelected ? 'pink.200' : undefined}
                      >
                        <StampSymbol stamp={stamp} />
                      </Button>
                    );
                  })}
                </Grid>

                <Stack mt={4} gap={3}>
                  {revealed.length > 0 && <Badge colorPalette="gray">Tap a revealed stamp to view details</Badge>}

                  {selectedStamp && rewardIssuances.has(selectedStamp) && (
                    <Box bg="white" borderRadius="md" p={3}>
                      <Text fontWeight="semibold">
                        {selectedStamp}) {rewardIssuances.get(selectedStamp).reward_title}
                      </Text>
                      <Text fontSize="sm" color="gray.700" mt={1}>
                        Status: {statusText(rewardIssuances.get(selectedStamp), cardExpiresAt)}
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        Valid until: {new Date(cardExpiresAt).toLocaleDateString()}
                      </Text>
                      <Text fontSize="sm" color="gray.600" mt={2}>
                        Show this screen to staff to get your reward.
                      </Text>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Card.Body>
        </Card.Root>
      )}
    </Layout>
  );
}
