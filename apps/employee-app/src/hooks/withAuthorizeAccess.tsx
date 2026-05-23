import { ComponentType, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getToken, TOKEN_KEY } from '../lib/session';

export function withAuthorizeAccess<P extends object>(
  WrappedComponent: ComponentType<P>,
) {
  return function AuthorizedComponent(props: P) {
    const navigate = useNavigate();
    const token = getToken();
    const location = useLocation();

    useEffect(() => {
      function onStorage(e: StorageEvent) {
        if (e.key !== TOKEN_KEY) return;
        if (!e.newValue) {
          navigate('/logout');
        }
      }
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    }, [navigate]);

    if (!token) {
      const next = encodeURIComponent(location.pathname + location.search);
      return <Navigate to={`/login?next=${next}`} replace />;
    }

    return <WrappedComponent {...props} />;
  };
}
