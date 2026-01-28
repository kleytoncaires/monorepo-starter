import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { authService } from '@/services/auth.service';
import { PasswordStrengthIndicator } from '@/components';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/schemas';
import { ROUTES } from '@/constants/routes.constants';

type PageStatus = 'validating' | 'valid' | 'invalid';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { showError, showSuccess } = useToast();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<PageStatus>('validating');
  const [tokenEmail, setTokenEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isDifferentUser =
    isAuthenticated &&
    tokenEmail &&
    user?.email &&
    !user.email.includes(tokenEmail.split('@')[0].replace(/\*/g, ''));

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const password = watch('password');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setStatus('invalid');
        return;
      }

      try {
        const result = await authService.validateResetToken(token);
        if (result.valid && result.email) {
          setTokenEmail(result.email);
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      } catch {
        setStatus('invalid');
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    setIsLoading(true);

    try {
      await authService.resetPassword(token, data.password);
      showSuccess('Senha redefinida com sucesso!');
      if (isAuthenticated) {
        await logout();
      }
      navigate(ROUTES.LOGIN);
    } catch {
      showError('Falha ao redefinir senha. O link pode estar expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAndContinue = async () => {
    await logout();
  };

  if (status === 'validating') {
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
          sx={{ border: 1, borderColor: 'divider', borderRadius: 3, maxWidth: 420, width: '100%' }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Validando link...</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (status === 'invalid') {
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
          sx={{ border: 1, borderColor: 'divider', borderRadius: 3, maxWidth: 420, width: '100%' }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box component="img" src="/logo.svg" alt="Logo" sx={{ height: 40, mb: 3 }} />
            <Typography variant="h4" component="h1" fontWeight={700} color="error.main">
              Link Inválido
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
              Este link de recuperação de senha é inválido ou expirou.
            </Typography>
            <Button
              component={RouterLink}
              to={ROUTES.FORGOT_PASSWORD}
              fullWidth
              variant="contained"
              size="large"
              sx={{ py: 1.5 }}
            >
              Solicitar Novo Link
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
        sx={{ border: 1, borderColor: 'divider', borderRadius: 3, maxWidth: 420, width: '100%' }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box component="img" src="/logo.svg" alt="Logo" sx={{ height: 40, mb: 3 }} />
            <Typography variant="h4" component="h1" fontWeight={700}>
              Redefinir Senha
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Conta: {tokenEmail}
            </Typography>
          </Box>

          {isDifferentUser && (
            <Alert
              severity="warning"
              icon={<AlertTriangle size={20} />}
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small" onClick={handleLogoutAndContinue}>
                  Sair
                </Button>
              }
            >
              Você está logado como <strong>{user?.email}</strong>. Este link é para outra conta.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <input
              type="email"
              name="username"
              autoComplete="username"
              value={tokenEmail}
              readOnly
              style={{
                border: 0,
                clip: 'rect(0, 0, 0, 0)',
                height: 1,
                margin: -1,
                overflow: 'hidden',
                padding: 0,
                position: 'absolute',
                whiteSpace: 'nowrap',
                width: 1,
              }}
            />
            <TextField
              fullWidth
              label="Nova Senha"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              margin="normal"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...register('password')}
            />

            <PasswordStrengthIndicator password={password || ''} />

            <TextField
              fullWidth
              label="Confirmar Senha"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              margin="normal"
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!isValid || isLoading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>

            <Button
              component={RouterLink}
              to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN}
              fullWidth
              variant="outlined"
              size="large"
              sx={{ mt: 2, py: 1.5 }}
            >
              {isAuthenticated ? 'Ir para Dashboard' : 'Voltar para Login'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
