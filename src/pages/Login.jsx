import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Input, Label, Alert } from '../components/ui';
import GoogleLoginButton from '../components/GoogleLoginButton';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
 
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-6 max-w-sm sm:mt-12">
      <div className="mb-6 text-center">
        <div className="mb-2 text-4xl">🏔️</div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to book your Uttarakhand trip.</p>
      </div>

      <Card className="p-6">
        {/* <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required
            />
          </div>
          <div className="space-y-1">
            <Label>Password</Label>
            <Input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required
            />
          </div>
          <Alert type="error">{error}</Alert>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </Button>
        </form> */}

        {/* <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          or
          <div className="h-px flex-1 bg-slate-200" />
        </div> */}

        <div className="flex justify-center">
          <GoogleLoginButton onError={setError} />
        </div>

        {/* <p className="mt-4 text-center text-sm text-slate-500">
          New here?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">Create an account</Link>
        </p> */}
      </Card>
    </div>
  );
}
