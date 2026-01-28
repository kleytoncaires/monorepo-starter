import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LoginCredentials, RegisterCredentials, AuthState } from '@/types/auth';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes.constants';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_CHECK_INTERVAL = 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const authCheckAttempted = useRef(false);
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const checkAuth = useCallback(async () => {
    const token = authService.getAccessToken();
    if (!token) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      setState({ user, isAuthenticated: true, isLoading: false });
    } catch {
      authService.clearTokens();
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    if (authCheckAttempted.current) return;
    authCheckAttempted.current = true;
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleTokenRefreshed = () => {
      checkAuth();
    };

    window.addEventListener('auth:token-refreshed', handleTokenRefreshed);
    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
    };
  }, [checkAuth]);

  useEffect(() => {
    if (!state.isAuthenticated) return;

    const checkSessionValidity = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return;

      const isValid = await authService.checkSession(refreshToken);
      if (!isValid) {
        authService.clearTokens();
        setState({ user: null, isAuthenticated: false, isLoading: false });
        navigate(ROUTES.LOGIN);
      }
    };

    const intervalId = setInterval(checkSessionValidity, SESSION_CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, [state.isAuthenticated, navigate]);

  const login = async (credentials: LoginCredentials) => {
    const tokens = await authService.login(credentials);
    authService.saveTokens(tokens);
    await checkAuth();
    navigate(ROUTES.DASHBOARD);
  };

  const register = async (credentials: RegisterCredentials) => {
    await authService.register(credentials);
  };

  const logout = async () => {
    await authService.logout();
    authService.clearTokens();
    setState({ user: null, isAuthenticated: false, isLoading: false });
    navigate(ROUTES.LOGIN);
  };

  const updateUser = (user: User) => {
    setState(prev => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
