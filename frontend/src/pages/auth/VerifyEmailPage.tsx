import { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes.constants';

type VerifyStatus = 'validating' | 'verifying' | 'success' | 'error' | 'invalid-token';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, logout } = useAuth();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<VerifyStatus>('validating');
  const [tokenEmail, setTokenEmail] = useState<string>('');
  const verificationAttempted = useRef(false);

  const redirectRoute = isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN;
  const redirectLabel = isAuthenticated ? 'Ir para Dashboard' : 'Fazer Login';

  const isDifferentUser =
    isAuthenticated &&
    tokenEmail &&
    user?.email &&
    !user.email.includes(tokenEmail.split('@')[0].replace(/\*/g, ''));

  useEffect(() => {
    const processToken = async () => {
      if (verificationAttempted.current) return;
      verificationAttempted.current = true;

      if (!token) {
        setStatus('invalid-token');
        return;
      }

      try {
        const validation = await authService.validateVerificationToken(token);
        if (!validation.valid) {
          setStatus('invalid-token');
          return;
        }

        if (validation.email) {
          setTokenEmail(validation.email);
        }

        setStatus('verifying');
        await authService.verifyEmail(token);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };

    processToken();
  }, [token]);

  const handleLogout = async () => {
    await logout();
  };

  const renderContent = () => {
    switch (status) {
      case 'validating':
      case 'verifying':
        return (
          <>
            <CircularProgress sx={{ mb: 3 }} />
            <Typography variant="h5" component="h1" fontWeight={700}>
              {status === 'validating' ? 'Validando link...' : 'Verificando email...'}
            </Typography>
            {tokenEmail && (
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Conta: {tokenEmail}
              </Typography>
            )}
          </>
        );

      case 'success':
        return (
          <>
            <Typography variant="h4" component="h1" fontWeight={700} color="success.main">
              Email Verificado!
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              Sua conta foi ativada com sucesso.
            </Typography>
            {isDifferentUser && (
              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                O email verificado foi <strong>{tokenEmail}</strong>. Você está logado como{' '}
                <strong>{user?.email}</strong>.
              </Alert>
            )}
            <Button
              component={RouterLink}
              to={redirectRoute}
              fullWidth
              variant="contained"
              size="large"
              sx={{ py: 1.5 }}
            >
              {redirectLabel}
            </Button>
          </>
        );

      case 'error':
        return (
          <>
            <Typography variant="h4" component="h1" fontWeight={700} color="error.main">
              Erro na Verificação
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
              Não foi possível verificar seu email. Tente novamente.
            </Typography>
            <Button
              component={RouterLink}
              to={redirectRoute}
              fullWidth
              variant="contained"
              size="large"
              sx={{ py: 1.5 }}
            >
              {isAuthenticated ? 'Ir para Dashboard' : 'Voltar para Login'}
            </Button>
          </>
        );

      case 'invalid-token':
        return (
          <>
            <Typography variant="h4" component="h1" fontWeight={700} color="error.main">
              Link Inválido
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
              Este link de verificação é inválido ou expirou.
            </Typography>
            {isDifferentUser && (
              <Alert
                severity="warning"
                icon={<AlertTriangle size={20} />}
                sx={{ mb: 3, textAlign: 'left' }}
                action={
                  <Button color="inherit" size="small" onClick={handleLogout}>
                    Sair
                  </Button>
                }
              >
                Você está logado como <strong>{user?.email}</strong>.
              </Alert>
            )}
            <Button
              component={RouterLink}
              to={redirectRoute}
              fullWidth
              variant="contained"
              size="large"
              sx={{ py: 1.5 }}
            >
              {isAuthenticated ? 'Ir para Dashboard' : 'Voltar para Login'}
            </Button>
          </>
        );
    }
  };

  return (
    <Box
      sx={{
        alignItems: 'center',
        background: theme =>
          `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
          maxWidth: 420,
          width: '100%',
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Box component="img" src="/logo.svg" alt="Logo" sx={{ height: 40, mb: 3 }} />
          {renderContent()}
        </CardContent>
      </Card>
    </Box>
  );
}
