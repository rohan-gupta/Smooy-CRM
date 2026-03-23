import { forwardRef } from 'react'
import { Button } from '@chakra-ui/react'

const SubmitButton = forwardRef(function SubmitButton(
  { children, type = 'button', w = 'full', ...props },
  ref
) {
  return (
    <Button
      ref={ref}
      type={type}
      w={w}
      h="56px"
      borderRadius="full"
      fontWeight="bold"
      fontSize="xl"
      color="white"
      bg="linear-gradient(to right, #ec4899, #db2777)"
      _hover={{
        bg: 'linear-gradient(to right, #db2777, #be185d)',
      }}
      _active={{
        bg: 'linear-gradient(to right, #be185d, #9d174d)',
        transform: 'scale(0.98)',
      }}
      boxShadow="0 8px 24px rgba(219, 39, 119, 0.4)"
      {...props}
    >
      {children}
    </Button>
  )
})

export default SubmitButton
