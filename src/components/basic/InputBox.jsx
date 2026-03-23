import { forwardRef } from 'react'
import { Box, HStack, Input, Text } from '@chakra-ui/react'

const InputBox = forwardRef(function InputBox(
  {
    value,
    onChange,
    placeholder = 'Phone number',
    inputMode = 'tel',
    withPrefix = true,
    prefixEmoji = '🇸🇬',
    prefixText = '+65',
    rightIcon = null,
    ...props
  },
  ref
) {
  return (
    <Box
      w="full"
      border="2px solid"
      borderColor="rgba(240,138,197,0.55)"
      borderRadius="18px"
      bg="rgba(255,255,255,0.55)"
      h="62px"
      px={4}
    >
      <HStack spacing={4} align="center" h="full">
        {withPrefix && (
          <>
            <Text fontWeight="400" fontSize="xl" lineHeight="1">
              {prefixEmoji}
            </Text>

            <Text fontWeight="700" fontSize="md" color="gray.700">
              {prefixText}
            </Text>

            <Box w="1px" h="28px" bg="rgba(93,72,94,0.18)" />
          </>
        )}

        <Input
          ref={ref}
          variant="unstyled"
          inputMode={inputMode}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          fontWeight="400"
          fontSize="md"
          h="full"
          py={0}
          px={0}
          flex="1"
          minW={0}
          color="gray.700"
          {...props}
        />

        {rightIcon ? (
          <Box display="grid" placeItems="center" w="26px" color="pink.500">
            <Text fontSize="xl" lineHeight="1">
              {rightIcon}
            </Text>
          </Box>
        ) : null}
      </HStack>
    </Box>
  )
})

export default InputBox
