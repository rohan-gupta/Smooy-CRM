import Layout from '../components/Layout';
import LoginForm from '../components/LoginForm';
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
