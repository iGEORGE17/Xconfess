import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_TOKEN_KEY, USER_DATA_KEY } from './constants';

interface User {
id: string;
username: string;
email: string;
}

export function useAuth() {
const [user, setUser] = useState<User | null>(null);
const [isLoading, setIsLoading] = useState(true);
const router = useRouter();

useEffect(() => {
checkAuth();
}, []);

const checkAuth = async () => {
const token = localStorage.getItem(AUTH_TOKEN_KEY);

if (!token) {
  setIsLoading(false);
  return;
}

try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const userData = await response.json();
    setUser(userData);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  }
} catch (error) {
  console.error('Auth check failed:', error);
} finally {
  setIsLoading(false);
}
};

const logout = () => {
localStorage.removeItem(AUTH_TOKEN_KEY);
localStorage.removeItem(USER_DATA_KEY);
setUser(null);
router.push('/login');
};

return { user, isLoading, logout, checkAuth };
}
