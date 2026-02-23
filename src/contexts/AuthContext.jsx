import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { ensureUserProfile, logoutUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          const userProfile = await ensureUserProfile(firebaseUser);
          setUser(firebaseUser);
          setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, role: profile?.role || null, logout: logoutUser }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
