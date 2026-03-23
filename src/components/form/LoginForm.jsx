import { Text } from '@chakra-ui/react';
import FormCard from './FormCard';
import { InputBox, SubmitButton } from '../basic';

export default function LoginForm({ phone, onPhoneChange, onSubmit }) {
  return (
    <FormCard
      title="Log In to Your Loyalty Account"
      subtitle="Enter your mobile number to get started."
      gap={4}
    >
      <InputBox value={phone} onChange={onPhoneChange} placeholder="Phone number" />
      <SubmitButton onClick={onSubmit}>Continue</SubmitButton>
      <Text fontSize="sm" color="gray.500" textAlign="center">
        We'll send you a one-time code
      </Text>
    </FormCard>
  );
}
