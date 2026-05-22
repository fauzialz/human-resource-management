import { useEffect, useRef } from 'react';
import { clearSession } from '../lib/session';

const LogoutPage = () => {
  const redirect = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    clearSession();

    redirect.current = setTimeout(() => {
      window.location.href = '/login';
    }, 500);

    return () => {
      if (redirect.current) {
        clearTimeout(redirect.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
      <p className="text-gray-600">
        You will be redirected to the login page shortly.
      </p>
    </div>
  );
};

export default LogoutPage;
