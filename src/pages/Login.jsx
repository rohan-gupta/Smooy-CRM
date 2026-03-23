import { Layout } from '../components/layout';
import { LoginForm } from '../components/form';
import { useInputValue } from '../hooks/useInputValue';

export default function Login() {
  const phone = useInputValue('');

  const handleSubmit = () => {
    console.log('submit', phone.value);
  };

  return (
    <Layout>
      <LoginForm
        phone={phone.value}
        onPhoneChange={phone.onChange}
        onSubmit={handleSubmit}
      />
    </Layout>
  );
}
