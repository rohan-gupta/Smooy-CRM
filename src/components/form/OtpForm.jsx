import { HStack, Text } from '@chakra-ui/react';
import FormCard from './FormCard';
import { InputBox, SubmitButton } from '../basic';

export default function OtpForm({ phone, code, onCodeChange, onSubmit, onResend, countdown }) {
  return (
    <FormCard
      title="Enter Verification Code"
      subtitle={`We sent a 6-digit code to ${phone}`}
      gap={4}
    >
      <InputBox
        value={code}
        onChange={onCodeChange}
        placeholder="Enter code"
        inputMode="numeric"
        withPrefix={false}
      />
      <SubmitButton onClick={onSubmit}>Confirm</SubmitButton>
      <HStack justify="center" gap={2}>
        <Text fontSize="sm" color="gray.600">Haven't received it?</Text>
        <Text
          as="button"
          fontSize="sm"
          fontWeight="bold"
          fontStyle="italic"
          color="pink.500"
          onClick={onResend}
          cursor="pointer"
        >
          Resend code
        </Text>
      </HStack>
      {countdown != null && (
        <Text fontSize="sm" fontWeight="bold" color="pink.500" textAlign="center">
          {countdown}
        </Text>
      )}
    </FormCard>
  );
}
