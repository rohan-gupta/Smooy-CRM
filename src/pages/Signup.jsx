import { Layout } from '../components/layout';
import { SignUpForm } from '../components/form';
import { useInputValue } from '../hooks/useInputValue';

export default function Signup() {
  const name = useInputValue('');
  const email = useInputValue('');
  const dob = useInputValue('');

  const handleSubmit = () => {
    console.log('enroll', { name: name.value, email: email.value, dob: dob.value });
  };

  return (
    <Layout>
      <SignUpForm
        name={name.value}
        onNameChange={name.onChange}
        email={email.value}
        onEmailChange={email.onChange}
        dob={dob.value}
        onDobChange={dob.onChange}
        onSubmit={handleSubmit}
      />
    </Layout>
  );
}
