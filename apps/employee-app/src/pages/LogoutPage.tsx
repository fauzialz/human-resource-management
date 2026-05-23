import { useEffect, useRef } from 'react';
import { clearSession } from '../lib/session';

export default function LogoutPage() {
  const redirect = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    clearSession();
    redirect.current = setTimeout(() => {
      window.location.href = '/login';
    }, 500);
    return () => {
      if (redirect.current) clearTimeout(redirect.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-xl font-semibold text-gray-700 mb-2">Logging out…</h1>
      <p className="text-sm text-gray-500">You will be redirected to the login page.</p>
    </div>
  );
}
