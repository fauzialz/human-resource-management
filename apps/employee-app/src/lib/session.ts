interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
  position: string;
  phone: string;
  photoUrl?: string;
}

export const TOKEN_KEY = 'et';
const USER_KEY = 'eu';

export const setSession = (token: string, user: AuthUser) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const getUser = (): AuthUser | null => {
  const u = localStorage.getItem(USER_KEY);
  return u ? (JSON.parse(u) as AuthUser) : null;
};

export const updateUser = (partial: Partial<AuthUser>) => {
  const current = getUser();
  if (!current) return;
  localStorage.setItem(USER_KEY, JSON.stringify({ ...current, ...partial }));
};
