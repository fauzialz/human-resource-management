import { ComponentType, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getToken, TOKEN_KEY } from '../lib/session';

export function withPublicAccess<P extends object>(
  WrappedComponent: ComponentType<P>,
) {
  return function PublicComponent(props: P) {
    const navigate = useNavigate();
    const token = getToken();

    useEffect(() => {
      function onStorage(e: StorageEvent) {
        if (e.key !== TOKEN_KEY) return;
        if (e.newValue) {
          console.log(
            'login detected from another tab, redirecting to employees',
          );
          navigate('/employees');
        }
      }
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    }, []);

    if (token) {
      return <Navigate to="/employees" replace />;
    }

    return <WrappedComponent {...props} />;
  };
}
