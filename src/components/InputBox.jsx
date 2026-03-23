import { forwardRef } from 'react'
import { Box, HStack, Input, Text } from '@chakra-ui/react'

const InputBox = forwardRef(function InputBox(
  {
    value,
    onChange,
    placeholder = 'Phone number',
    inputMode = 'tel',
    withPrefix = true,
    prefixText = '+65',
    ...props
  },
  ref
) {
  return (
    <Box
      w="full"
      border="1.5px solid"
      borderColor="pink.300"
      borderRadius="16px"
      bg="pink.50"
      px={4}
      py={3}
    >
      <HStack spacing={4} align="center">
        {withPrefix && (
          <>
            <Text fontWeight="400" fontSize="md">
              {prefixText}
            </Text>

            <Box w="1px" h="28px" bg="pink.300" opacity={0.8} />
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
          h="auto"
          py={1}
          px={0}
          flex="1"
          {...props}
        />
      </HStack>
    </Box>
  )
})

export default InputBox
