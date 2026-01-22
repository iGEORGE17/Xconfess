'use client';

import { useState } from 'react';

type User = {
  username: string;
};

export function useAuth() {
  // TEMP mock (replace with real auth later)
  const [user, setUser] = useState<User | null>({
    username: 'sudipta',
  });

  const logout = () => {
    setUser(null);
    console.log('Logged out');
    // later: clear token, redirect, etc.
  };

  return {
    user,
    logout,
  };
}
