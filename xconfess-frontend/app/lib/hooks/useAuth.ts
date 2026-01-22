'use client';

type User = {
  username: string;
};

export function useAuth() {
  // TEMP mock (replace with real auth later)
  const user: User | null = {
    username: 'sudipta',
  };

  const logout = () => {
    console.log('Logged out');
    // later: clear token, redirect, etc.
  };

  return {
    user,
    logout,
  };
}
