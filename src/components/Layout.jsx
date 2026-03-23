import {
  Container,
  Flex,
  Heading,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';

/**
 * Base layout: optional title block + page content. Styling is Chakra tokens only.
 */
export default function Layout({ title, subtitle, children, headerActions }) {
  const showHeader = title != null || subtitle != null;

  return (
    <Container as="main" maxW="md" px={4} py={6}>
      <Stack gap={6}>
        {showHeader && (
          <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
            <VStack align="start" gap={1}>
              {title != null && (
                <Heading as="h1" size="lg">
                  {title}
                </Heading>
              )}
              {subtitle != null && (
                <Text color="gray.600" fontSize="sm">
                  {subtitle}
                </Text>
              )}
            </VStack>
            {headerActions}
          </Flex>
        )}
        {children}
      </Stack>
    </Container>
  );
}
