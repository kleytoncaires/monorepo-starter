import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { Mail } from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/schemas';
import { ROUTES } from '@/constants/routes.constants';

export default function ForgotPasswordPage() {
  const { showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', data);
      setIsSuccess(true);
    } catch {
      showError('Falha ao enviar email de recuperação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
            <Typography variant="h4" component="h1" fontWeight={700}>
              Verifique seu email
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
              Se existe uma conta com esse email, enviamos as instruções para redefinir sua senha.
            </Typography>
            <Button
              component={RouterLink}
              to={ROUTES.LOGIN}
              fullWidth
              variant="contained"
              size="large"
              sx={{ py: 1.5 }}
            >
              Voltar para Login
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
              Esqueci a Senha
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Digite seu email para receber as instruções
            </Typography>
          </Box>

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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!isValid || isLoading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </Button>

            <Button
              component={RouterLink}
              to={ROUTES.LOGIN}
              fullWidth
              variant="outlined"
              size="large"
              sx={{ mt: 2, py: 1.5 }}
            >
              Voltar para Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
