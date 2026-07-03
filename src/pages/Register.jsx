import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Input, Label, Alert } from '../components/ui';

const emptyForm = { name: '', email: '', phone: '', password: '' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // signup logs the user straight in (backend returns tokens)
      const user = await register(form);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-6 max-w-sm sm:mt-12">
      <div className="mb-6 text-center">
        <div className="mb-2 text-4xl">🏔️</div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Sign up to book your Uttarakhand trip.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input name="name" value={form.name} onChange={onChange} placeholder="Your name" required />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email" name="email" value={form.email} onChange={onChange}
              placeholder="you@example.com" required
            />
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input name="phone" value={form.phone} onChange={onChange} placeholder="Optional" />
          </div>
          <div className="space-y-1">
            <Label>Password</Label>
            <Input
              type="password" name="password" value={form.password} onChange={onChange}
              placeholder="••••••••" required
            />
          </div>
          <Alert type="error">{error}</Alert>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Sign up'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
