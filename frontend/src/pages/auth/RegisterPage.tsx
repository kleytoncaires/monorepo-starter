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
import IconButton from '@mui/material/IconButton';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { PasswordStrengthIndicator } from '@/components';
import { registerSchema, type RegisterFormData } from '@/schemas';
import { ROUTES } from '@/constants/routes.constants';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setIsSuccess(true);
    } catch {
      showError('Falha no cadastro. O email pode já estar em uso.');
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
              Enviamos um link de confirmação para seu email. Clique no link para ativar sua conta.
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
              Criar Conta
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Preencha os dados para se cadastrar
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Nome"
              margin="normal"
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={20} />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('name')}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
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
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>

            <Button
              component={RouterLink}
              to={ROUTES.LOGIN}
              fullWidth
              variant="outlined"
              size="large"
              sx={{ mt: 2, py: 1.5 }}
            >
              Já tenho uma conta
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
