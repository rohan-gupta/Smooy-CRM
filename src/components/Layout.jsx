import { Box, Stack } from '@chakra-ui/react';

export default function Layout({ children }) {
  return (
    <Box
      as="main"
      minH="100dvh"
      w="100%"
      bgImage="url(./assets/overlay2.png)"
      bgRepeat="no-repeat"
      bgPosition="top center"
      bgSize="contain"
      pb="env(safe-area-inset-bottom)"
    >
      <Stack gap={6} px={5}>
        {children}
      </Stack>
    </Box>
  );
}
