import FormCard from './FormCard';
import InputBox from './InputBox';
import SubmitButton from './SubmitButton';

export default function SignUpForm({ name, onNameChange, email, onEmailChange, dob, onDobChange, onSubmit }) {
  return (
    <FormCard
      title="Enter Your Details"
      subtitle="Please fill in the information below to create your loyalty account."
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
      <InputBox
        value={dob}
        onChange={onDobChange}
        placeholder="Date of Birth"
        inputMode="text"
        withPrefix={false}
        type="date"
      />
      <SubmitButton onClick={onSubmit}>Enroll</SubmitButton>
    </FormCard>
  );
}
