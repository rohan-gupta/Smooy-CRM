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
      h="clamp(48px, 14vw, 60px)"
      borderRadius="999px"
      fontWeight="800"
      fontSize="clamp(18px, 5.5vw, 24px)"
      color="white"
      bg="linear-gradient(180deg, #ff1f8f 0%, #e5007d 100%)"
      _hover={{
        bg: 'linear-gradient(180deg, #e5007d 0%, #be185d 100%)',
      }}
      _active={{
        bg: 'linear-gradient(180deg, #be185d 0%, #9d174d 100%)',
        transform: 'scale(0.98)',
      }}
      boxShadow="0 8px 18px rgba(229, 0, 125, 0.26)"
      {...props}
    >
      {children}
    </Button>
  )
})

export default SubmitButton
