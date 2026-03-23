import FormCard from './FormCard';
import { InputBox, SubmitButton, DatePickerBox } from '../basic';

export default function SignUpForm({ name, onNameChange, email, onEmailChange, dob, onDobChange, onSubmit }) {
  return (
    <FormCard
      title="Enter Your Details"
      subtitle="Please fill in the information below to create your loyalty account."
      gap={3}
    >
      <InputBox
        value={name}
        onChange={onNameChange}
        placeholder="Name"
        inputMode="text"
        withPrefix={false}
      />
      <InputBox
        value={email}
        onChange={onEmailChange}
        placeholder="Email"
        inputMode="email"
        withPrefix={false}
      />
      <DatePickerBox
        value={dob}
        onChange={onDobChange}
      />
      <SubmitButton onClick={onSubmit}>Enroll</SubmitButton>
    </FormCard>
  );
}
