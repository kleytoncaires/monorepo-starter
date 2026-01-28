import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { theme } from './styles/theme';
import { ROUTES } from './constants/routes.constants';

vi.mock('./services/auth.service', () => ({
  authService: {
    getAccessToken: vi.fn().mockReturnValue(null),
    getCurrentUser: vi.fn(),
    saveTokens: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

function renderApp(initialRoute: string = ROUTES.LOGIN) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <ThemeProvider theme={theme}>
          <ToastProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login page on /login route', async () => {
    renderApp(ROUTES.LOGIN);

    expect(await screen.findByRole('heading', { name: 'Bem-vindo' })).toBeInTheDocument();
  });

  it('should render register page on /register route', async () => {
    renderApp(ROUTES.REGISTER);

    expect(await screen.findByRole('heading', { name: 'Criar Conta' })).toBeInTheDocument();
  });
});
