import { Button, Stack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { CONFIG } from '../config';

export default function Home() {
  return (
    <Layout
      title={CONFIG.STORE_DISPLAY_NAME}
      subtitle="Welcome to the Smooy PRM Loyalty Club"
    >
      <Stack as="section" gap={3}>
        <Button as={Link} to="/customer" colorPalette="pink" size="lg">
          Customer loyalty card
        </Button>
        <Button as={Link} to="/staff" variant="outline" colorPalette="pink" size="lg">
          Staff portal
        </Button>
      </Stack>
      <Text as="footer" color="gray.600" fontSize="sm">
        Built for phone-first use. Staff actions are gated to staff auth accounts.
      </Text>
    </Layout>
  );
}
