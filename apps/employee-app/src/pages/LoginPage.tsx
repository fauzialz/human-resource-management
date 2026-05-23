import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { setSession } from '../lib/session';
import { Input, InputPassword } from '@human-resource-management/ui-components';
import type { LoginDtoResponse } from '@human-resource-management/shared-types';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    const res = await api.post<LoginDtoResponse>('/auth/login', {
      email,
      password,
    });
    setLoading(false);

    if (res.statusCode !== 201) {
      setError(res.message);
      setFieldErrors({
        email: res.errors?.fieldErrors?.email?.[0] ?? '',
        password: res.errors?.fieldErrors?.password?.[0] ?? '',
      });
      return;
    }

    setSession(res.data.access_token, res.data.user);
    const next = searchParams.get('next');
    if (next && !next.includes('logout')) {
      navigate(next, { replace: true });
    } else {
      navigate('/attendance', { replace: true });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Employee Login</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="email"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
            />
          </div>

          <div className="mt-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <InputPassword
              id="password"
              required
              value={password}
              onChange={setPassword}
              error={fieldErrors.password}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
