import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const {
    isLoading: auth0Loading,
    isAuthenticated: auth0Authenticated,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [user, setUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [auth0Syncing, setAuth0Syncing] = useState(false);
  const auth0SyncStarted = useRef(false);
  const userRef = useRef(null);

  const updateUser = useCallback((nextUser) => {
    userRef.current = nextUser;
    setUser(nextUser);
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data } = await api.get('/auth/me');
        updateUser(data);
      } catch {
        if (!userRef.current) updateUser(null);
      } finally {
        setSessionLoading(false);
      }
    };

    loadSession();
  }, [updateUser]);

  useEffect(() => {
    if (!auth0Authenticated) {
      auth0SyncStarted.current = false;
      return;
    }

    if (sessionLoading || user || auth0SyncStarted.current) return;

    const syncAuth0User = async () => {
      auth0SyncStarted.current = true;
      setAuth0Syncing(true);

      try {
        const accessToken = await getAccessTokenSilently();
        const { data } = await api.post('/auth/auth0-sync', {}, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        updateUser(data);
      } catch (error) {
        console.error('Auth0 sync failed:', error);
        auth0SyncStarted.current = false;
        toast.error(error.response?.data?.error || error.message || 'Could not finish Auth0 login');
      } finally {
        setAuth0Syncing(false);
      }
    };

    syncAuth0User();
  }, [auth0Authenticated, getAccessTokenSilently, sessionLoading, updateUser, user]);

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const isSessionCheck = error.config?.url?.includes('/auth/me');
        const isLoginRequest = error.config?.url?.includes('/auth/login');

        if (error.response?.status === 401 && !isSessionCheck && !isLoginRequest) {
          updateUser(null);
        }
        return Promise.reject(error);
      },
    );

    return () => api.interceptors.response.eject(interceptorId);
  }, [updateUser]);

  const login = useCallback((userData) => {
    updateUser(userData);
  }, [updateUser]);

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {});
    updateUser(null);

    if (auth0Authenticated) {
      auth0Logout({ logoutParams: { returnTo: `${window.location.origin}/login` } });
    }
  }, [auth0Authenticated, auth0Logout, updateUser]);

  const loginWithAuth0 = useCallback(() => {
    loginWithRedirect();
  }, [loginWithRedirect]);

  const signupWithAuth0 = useCallback(() => {
    loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } });
  }, [loginWithRedirect]);

  const loading = sessionLoading || auth0Loading || auth0Syncing;

  return (
    <AuthContext.Provider value={{
      isAuthenticated: Boolean(user),
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

export const useAuth = () => useContext(AuthContext);
