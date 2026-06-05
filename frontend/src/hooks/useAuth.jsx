import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../utils/api';

const AuthContext = createContext();

/**
 * AuthProvider — Unified authentication provider
 * 
 * Supports TWO auth strategies:
 * 1. Normal (email/password) → JWT stored in localStorage
 * 2. Auth0 (Google, GitHub, etc.) → Auth0 SDK manages tokens
 * 
 * Both strategies expose the same interface via useAuth().
 */
export const AuthProvider = ({ children }) => {
  // ─── Normal Auth State ──────────────────────────
  const [normalUser, setNormalUser] = useState(null);
  const [normalLoading, setNormalLoading] = useState(true);

  // ─── Auth0 State ────────────────────────────────
  const {
    isLoading: auth0Loading,
    isAuthenticated: auth0Authenticated,
    user: auth0User,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [auth0Synced, setAuth0Synced] = useState(false);
  const [auth0SyncedUser, setAuth0SyncedUser] = useState(null);

  // ─── Logout guard ──────────────────────────────
  // Prevents the Auth0 sync effect from re-firing during logout.
  const isLoggingOutRef = useRef(false);

  // ─── Restore normal session from localStorage ───
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setNormalUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setNormalLoading(false);
  }, []);

  // ─── Sync Auth0 user to backend ────────────────
  // When Auth0 authenticates, we call our backend to
  // create/find a matching user record so the rest of
  // the app can use a consistent user._id for queries.
  useEffect(() => {
    const syncAuth0User = async () => {
      // CRITICAL: Do NOT re-sync if we are in the middle of logging out.
      if (isLoggingOutRef.current) return;
      if (!auth0Authenticated || !auth0User || auth0Synced) return;

      // If we already have a stored session from a previous Auth0 login,
      // restore it instead of calling the sync API again
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.email === auth0User.email) {
            setAuth0SyncedUser(parsed);
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            setAuth0Synced(true);
            return;
          }
        } catch { /* corrupted storage, continue to sync */ }
      }

      try {
        const res = await api.post('/auth/auth0-sync', {
          email: auth0User.email,
          name: auth0User.name || auth0User.nickname || 'Auth0 User',
          auth0Id: auth0User.sub,
          picture: auth0User.picture,
        });

        const userData = res.data;
        setAuth0SyncedUser(userData);
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify({
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          picture: userData.picture,
        }));
        api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        setAuth0Synced(true);
      } catch (err) {
        console.error('Auth0 sync failed:', err);
        // CRITICAL: Still mark as synced so loading doesn't hang forever.
        // The user won't have a backend session, but at least the UI won't freeze.
        setAuth0Synced(true);
      }
    };

    syncAuth0User();
  }, [auth0Authenticated, auth0User, auth0Synced]);

  // ─── Token Protection ──────────────────────────
  // Detect token deletion and force-logout.

  const forceLogout = useCallback(() => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    setNormalUser(null);
    setAuth0SyncedUser(null);
    setAuth0Synced(false);
    delete api.defaults.headers.common['Authorization'];

    // Hard redirect to login
    if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
      window.location.href = '/login';
    }

    setTimeout(() => { isLoggingOutRef.current = false; }, 2000);
  }, []);

  // 1. Cross-tab detection: fires when another tab removes the token
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        forceLogout();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [forceLogout]);

  // 2. Same-tab periodic check: catches manual DevTools deletion etc.
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLoggingOutRef.current) return;
      const token = localStorage.getItem('token');
      const hasSession = normalUser || (auth0Authenticated && auth0Synced);
      if (!token && hasSession) {
        forceLogout();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [normalUser, auth0Authenticated, auth0Synced, forceLogout]);

  // 3. Axios 401 interceptor: if backend rejects our token, force logout
  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          forceLogout();
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptorId);
  }, [forceLogout]);

  // ─── Normal Login ──────────────────────────────
  const login = useCallback((userData) => {
    setNormalUser({
      _id: userData._id,
      name: userData.name,
      email: userData.email,
    });
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify({
      _id: userData._id,
      name: userData.name,
      email: userData.email,
    }));
    api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  }, []);

  // ─── Unified Logout ───────────────────────────
  const logout = useCallback(() => {
    // Set the guard FIRST so the sync effect won't re-fire
    isLoggingOutRef.current = true;

    // Clear local state
    setNormalUser(null);
    setAuth0SyncedUser(null);
    setAuth0Synced(false);

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    delete api.defaults.headers.common['Authorization'];

    // If Auth0 session exists, log out from Auth0 too.
    // auth0Logout does a full page redirect to Auth0 and back to returnTo.
    // We do NOT navigate('/login') here — Auth0 handles the redirect.
    if (auth0Authenticated) {
      auth0Logout({ logoutParams: { returnTo: `${window.location.origin}/login` } });
      return; // stop here — page will redirect
    }

    // For normal (non-Auth0) users, reset the guard after a delay
    setTimeout(() => { isLoggingOutRef.current = false; }, 2000);
  }, [auth0Authenticated, auth0Logout]);

  // ─── Auth0 Social Login Helpers ────────────────
  const loginWithAuth0 = useCallback(() => {
    loginWithRedirect();
  }, [loginWithRedirect]);

  const signupWithAuth0 = useCallback(() => {
    loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } });
  }, [loginWithRedirect]);

  // ─── Derived State ────────────────────────────
  // If we're logging out, force isAuthenticated to false
  const isAuthenticated = isLoggingOutRef.current
    ? false
    : (!!normalUser || (auth0Authenticated && auth0Synced));

  const loading = isLoggingOutRef.current
    ? false
    : (normalLoading || auth0Loading || (auth0Authenticated && !auth0Synced));

  const user = normalUser || (auth0SyncedUser ? {
    _id: auth0SyncedUser._id,
    name: auth0SyncedUser.name,
    email: auth0SyncedUser.email,
    picture: auth0SyncedUser.picture || auth0User?.picture,
  } : null);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      loading,
      user,
      login,
      logout,
      loginWithAuth0,
      signupWithAuth0,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
