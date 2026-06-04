import { useState, useEffect } from 'react';
import { onAuth, type User } from '../firebase/auth';

export type AuthState = 'loading' | 'signed-out' | 'signed-in';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    return onAuth((u) => {
      setUser(u);
      setAuthState(u ? 'signed-in' : 'signed-out');
    });
  }, []);

  return { user, authState };
}
