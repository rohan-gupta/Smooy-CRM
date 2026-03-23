import { Button } from '@chakra-ui/react';

export default function SubmitButton({ ref, ...props }) {
  return <Button ref={ref} type="submit" {...props} />;
}
