interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export const TOKEN_KEY = 'at';
const USER_KEY = 'au';

export const setSession = (token: string, user: AuthUser) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getUser = (): AuthUser | null => {
  const u = localStorage.getItem(USER_KEY);
  return u ? (JSON.parse(u) as AuthUser) : null;
};
