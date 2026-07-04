import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// onError: optional callback so the parent page can show its own error message
export default function GoogleLoginButton({ onError }) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    const credential = credentialResponse?.credential;
    if (!credential) {
      onError?.('Google did not  return a valid token.');
      return;
    }
    try {
      const user = await loginWithGoogle(credential);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      onError?.(err.response?.data?.error || 'Google sign-in failed. Please try again.');
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => onError?.('Google sign-in failed. Please try again.')}
    />
  );
}
