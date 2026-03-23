import { Box, Heading, Stack, Text } from '@chakra-ui/react';

export default function FormCard({ title, subtitle, gap = 2, children }) {
  return (
    <Box bg="rgba(255,255,255,0.50)" borderRadius="2xl" p={3} mt="40%" boxShadow="lg">
      <Stack gap={gap}>
        <Stack gap={1}>
          <Heading as="h2" size="lg" fontWeight="bold" textAlign="center">
            {title}
          </Heading>
          <Box h="1px" bg="gray.300" />
          <Text fontSize="sm" color="gray.600" textAlign="center">
            {subtitle}
          </Text>
        </Stack>
        {children}
      </Stack>
    </Box>
  );
}
