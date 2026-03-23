import { Input } from '@chakra-ui/react';

export default function InputBox({ ref, ...props }) {
  return <Input ref={ref} {...props} />;
}
