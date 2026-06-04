import { useState, useEffect } from 'react';
import { onAuth, signInAnon, type User } from '../firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuth(async (u) => {
      if (!u) {
        // Auto sign-in anonymously on first visit
        try {
          await signInAnon();
        } catch {
          setReady(true);
        }
      } else {
        setUser(u);
        setReady(true);
      }
    });
  }, []);

  return { user, ready };
}
