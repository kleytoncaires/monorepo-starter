import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { authService } from '@/services/auth.service';
import { loginSchema, type LoginFormData } from '@/schemas';
import { ROUTES } from '@/constants/routes.constants';
import { AxiosError } from 'axios';

export default function LoginPage() {
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setEmailNotVerified(null);

    try {
      await login(data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      if (axiosError.response?.data?.message === 'Email not verified') {
        setEmailNotVerified(data.email);
      } else {
        showError('Email ou senha inválidos');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!emailNotVerified) return;

    setIsResending(true);
    try {
      await authService.resendVerificationEmail(emailNotVerified);
      showSuccess('Email de verificação reenviado!');
      setEmailNotVerified(null);
    } catch {
      showError('Erro ao reenviar email');
    } finally {
      setIsResending(false);
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
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box component="img" src="/logo.svg" alt="Logo" sx={{ height: 40, mb: 3 }} />
            <Typography variant="h4" component="h1" fontWeight={700}>
              Bem-vindo
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Entre com suas credenciais para continuar
            </Typography>
          </Box>

          {emailNotVerified && (
            <Box
              sx={{
                bgcolor: 'warning.lighter',
                border: 1,
                borderColor: 'warning.main',
                borderRadius: 2,
                mb: 3,
                p: 2,
              }}
            >
              <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ color: 'warning.main' }}>
                  <Mail size={20} />
                </Box>
                <Typography fontWeight={600} color="warning.dark">
                  Email não verificado
                </Typography>
              </Box>
              <Typography variant="body2" color="warning.dark" sx={{ mb: 2 }}>
                Verifique sua caixa de entrada e clique no link de confirmação para ativar sua
                conta.
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleResendVerification}
                disabled={isResending}
                color="warning"
              >
                {isResending ? 'Enviando...' : 'Reenviar email de verificação'}
              </Button>
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              margin="normal"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('email')}
            />

            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
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

            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value ?? false} color="primary" />}
                  label="Lembrar de mim"
                  sx={{ mt: 1 }}
                />
              )}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!isValid || isLoading}
              sx={{ mt: 2, py: 1.5 }}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <Button
              component={RouterLink}
              to={ROUTES.REGISTER}
              fullWidth
              variant="outlined"
              size="large"
              sx={{ mt: 2, py: 1.5 }}
            >
              Criar nova conta
            </Button>

            <Button
              component={RouterLink}
              to={ROUTES.FORGOT_PASSWORD}
              fullWidth
              variant="text"
              size="large"
              sx={{ mt: 1 }}
            >
              Esqueceu a senha?
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
