import { Box, Heading, Stack, Text } from '@chakra-ui/react';

export default function FormCard({ title, subtitle, gap = 2, children }) {
  const hasSubtitle = subtitle != null && subtitle !== '';

  return (
    <Box
      w="full"
      bg="rgba(255,245,252,0.82)"
      borderRadius="28px"
      p={6}
      boxShadow="0 10px 35px rgba(178, 70, 132, 0.14)"
      border="1px solid rgba(255,255,255,0.50)"
    >
      <Stack gap={gap}>
        <Stack gap={1}>
          <Heading as="h2" fontSize="clamp(18px, 5.5vw, 24px)" fontWeight="bold" textAlign="center">
            {title}
          </Heading>
          {hasSubtitle ? (
            <>
              <Box h="1px" bg="gray.300" />
              <Text fontSize="clamp(12px, 3.5vw, 15px)" color="gray.600" textAlign="center">
                {subtitle}
              </Text>
            </>
          ) : null}
        </Stack>
        {children}
      </Stack>
    </Box>
  );
}
