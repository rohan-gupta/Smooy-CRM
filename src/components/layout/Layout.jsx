import { Box, Stack } from '@chakra-ui/react';

export default function Layout({ children }) {
  return (
    <Box
      as="main"
      minH="100dvh"
      w="100%"
      overflowY="auto"
      overflowX="hidden"
      bg="linear-gradient(180deg, #ff58ae 0%, #ffd9ef 100%)"
      bgImage="url(./assets/overlay2.png)"
      bgRepeat="no-repeat"
      bgPosition="top center"
      bgSize="cover"
      pt="env(safe-area-inset-top)"
      pb="env(safe-area-inset-bottom)"
    >
      <Stack
        gap={6}
        px={5}
        pt="clamp(110px, 17vh, 185px)"
        pb={10}
        w="full"
        maxW="420px"
        mx="auto"
        justify="flex-start"
        align="stretch"
      >
        {children}
      </Stack>
    </Box>
  );
}
