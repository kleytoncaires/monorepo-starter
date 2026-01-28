import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Badge from '@mui/material/Badge';
import CircularProgress from '@mui/material/CircularProgress';
import {
  User,
  Mail,
  Save,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Phone,
  Calendar,
  Download,
  Shield,
  Trash2,
  Camera,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { PhoneInput, PasswordStrengthIndicator, PageHeader, Modal } from '@/components';
import api, { getUploadUrl } from '@/services/api';
import { usersService } from '@/services/users.service';
import { uploadService } from '@/services/upload.service';
import { ROLES } from '@/constants/roles.constants';
import { getInitials, formatDate } from '@/utils/string.utils';
import {
  profileSchema,
  changePasswordSchema,
  type ProfileFormData,
  type ChangePasswordFormData,
} from '@/schemas';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerProfile,
    control,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isDirty: isProfileDirty, isValid: isProfileValid },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors, isValid: isPasswordValid },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        phone: user.phone || '',
      });
    }
  }, [user, resetProfile]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      const response = await api.patch(`/users/${user?.id}`, {
        name: data.name,
        phone: data.phone || null,
      });
      updateUser(response.data);
      showSuccess('Perfil atualizado com sucesso!');
    } catch {
      showError('Falha ao atualizar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setIsPasswordLoading(true);

    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      showSuccess('Senha alterada com sucesso!');
      resetPassword();
    } catch {
      showError('Falha ao alterar senha. Verifique sua senha atual.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);

    try {
      const data = await usersService.exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meus-dados-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showSuccess('Dados exportados com sucesso!');
    } catch {
      showError('Falha ao exportar dados. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      await usersService.deleteMyAccount();
      showSuccess('Conta excluída com sucesso.');
      logout();
    } catch {
      showError('Falha ao excluir conta. Tente novamente.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showError('Formato inválido. Use JPG, PNG, GIF ou WebP.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showError('Arquivo muito grande. Tamanho máximo: 5MB.');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const response = await uploadService.uploadAvatar(file);
      updateUser({ ...user!, avatarUrl: response.url });
      showSuccess('Foto atualizada com sucesso!');
    } catch {
      showError('Falha ao enviar foto. Tente novamente.');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);

    try {
      await uploadService.removeAvatar();
      updateUser({ ...user!, avatarUrl: null });
      showSuccess('Foto removida com sucesso!');
    } catch {
      showError('Falha ao remover foto. Tente novamente.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <Box>
      <PageHeader
        icon={User}
        title="Meu Perfil"
        description="Gerencie suas informações pessoais e senha"
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box
                sx={{
                  alignItems: 'center',
                  bgcolor: 'action.hover',
                  display: 'flex',
                  flexDirection: 'column',
                  pt: 4,
                  pb: 3,
                  px: 3,
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    user?.avatarUrl ? (
                      <IconButton
                        size="small"
                        onClick={handleRemoveAvatar}
                        disabled={isUploadingAvatar}
                        sx={{
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' },
                          width: 28,
                          height: 28,
                        }}
                      >
                        <X size={14} />
                      </IconButton>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={handleAvatarClick}
                        disabled={isUploadingAvatar}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' },
                          width: 28,
                          height: 28,
                        }}
                      >
                        <Camera size={14} />
                      </IconButton>
                    )
                  }
                >
                  <Avatar
                    src={getUploadUrl(user?.avatarUrl)}
                    onClick={handleAvatarClick}
                    sx={{
                      bgcolor: 'primary.main',
                      cursor: isUploadingAvatar ? 'default' : 'pointer',
                      fontSize: '2rem',
                      fontWeight: 700,
                      height: 88,
                      width: 88,
                      '&:hover': {
                        opacity: isUploadingAvatar ? 1 : 0.8,
                      },
                    }}
                  >
                    {isUploadingAvatar ? (
                      <CircularProgress size={32} color="inherit" />
                    ) : user?.name ? (
                      getInitials(user.name)
                    ) : (
                      'U'
                    )}
                  </Avatar>
                </Badge>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                  Clique para alterar a foto
                </Typography>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.25 }}>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {user?.email}
                </Typography>
                <Chip
                  label={user?.role === ROLES.ADMIN ? 'Administrador' : 'Usuário'}
                  size="small"
                  color={user?.role === ROLES.ADMIN ? 'error' : 'primary'}
                />
              </Box>
              <Box sx={{ p: 2 }}>
                <Box
                  sx={{
                    bgcolor: 'action.selected',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      alignItems: 'center',
                      borderBottom: 1,
                      borderColor: 'divider',
                      display: 'flex',
                      gap: 1.5,
                      p: 2,
                    }}
                  >
                    <Box sx={{ color: 'primary.main' }}>
                      <Mail size={18} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase' }}
                      >
                        Email
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {user?.email}
                      </Typography>
                    </Box>
                  </Box>
                  {user?.phone && (
                    <Box
                      sx={{
                        alignItems: 'center',
                        borderBottom: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        gap: 1.5,
                        p: 2,
                      }}
                    >
                      <Box sx={{ color: 'secondary.main' }}>
                        <Phone size={18} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase' }}
                        >
                          Telefone
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {user.phone}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  <Box
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                      gap: 1.5,
                      p: 2,
                    }}
                  >
                    <Box sx={{ color: 'warning.main' }}>
                      <Calendar size={18} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase' }}
                      >
                        Membro desde
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {user?.createdAt ? formatDate(user.createdAt) : '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                Informações Pessoais
              </Typography>

              <Box component="form" onSubmit={handleProfileSubmit(onProfileSubmit)}>
                <TextField
                  fullWidth
                  label="Nome"
                  error={Boolean(profileErrors.name)}
                  helperText={profileErrors.name?.message}
                  sx={{ mb: 3 }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={18} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  {...registerProfile('name')}
                />

                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      fullWidth
                      label="Telefone"
                      value={field.value}
                      onAccept={value => field.onChange(value)}
                      onBlur={field.onBlur}
                      error={Boolean(profileErrors.phone)}
                      helperText={profileErrors.phone?.message}
                      sx={{ mb: 4 }}
                    />
                  )}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading || !isProfileDirty || !isProfileValid}
                  startIcon={<Save size={18} />}
                  sx={{ borderRadius: 2, px: 3 }}
                >
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    alignItems: 'center',
                    bgcolor: 'warning.main',
                    borderRadius: 1.5,
                    color: 'common.white',
                    display: 'flex',
                    height: 36,
                    justifyContent: 'center',
                    width: 36,
                  }}
                >
                  <KeyRound size={18} />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Alterar Senha
                </Typography>
              </Box>

              <Box component="form" onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                <TextField
                  fullWidth
                  label="Senha Atual"
                  type={showCurrentPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  error={Boolean(passwordErrors.currentPassword)}
                  helperText={passwordErrors.currentPassword?.message}
                  sx={{ mb: 3 }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={18} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                            size="small"
                          >
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  {...registerPassword('currentPassword')}
                />

                <TextField
                  fullWidth
                  label="Nova Senha"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  error={Boolean(passwordErrors.newPassword)}
                  helperText={passwordErrors.newPassword?.message}
                  sx={{ mb: 1 }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={18} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                            size="small"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  {...registerPassword('newPassword')}
                />

                <PasswordStrengthIndicator password={newPassword || ''} sx={{ mb: 4 }} />

                <TextField
                  fullWidth
                  label="Confirmar Nova Senha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  error={Boolean(passwordErrors.confirmPassword)}
                  helperText={passwordErrors.confirmPassword?.message}
                  sx={{ mb: 4, mt: 1 }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={18} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            size="small"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  {...registerPassword('confirmPassword')}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isPasswordValid || isPasswordLoading}
                  startIcon={<KeyRound size={18} />}
                  sx={{ borderRadius: 2, px: 3 }}
                >
                  {isPasswordLoading ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
              mt: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    alignItems: 'center',
                    bgcolor: 'info.main',
                    borderRadius: 1.5,
                    color: 'common.white',
                    display: 'flex',
                    height: 36,
                    justifyContent: 'center',
                    width: 36,
                  }}
                >
                  <Shield size={18} />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Privacidade e Dados
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você pode exportar
                todos os seus dados pessoais ou excluir sua conta permanentemente.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  onClick={handleExportData}
                  disabled={isExporting}
                  startIcon={<Download size={18} />}
                  sx={{ borderRadius: 2, px: 3 }}
                >
                  {isExporting ? 'Exportando...' : 'Exportar meus dados'}
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setShowDeleteModal(true)}
                  startIcon={<Trash2 size={18} />}
                  sx={{ borderRadius: 2, px: 3 }}
                >
                  Excluir minha conta
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Excluir Conta"
        confirmText={isDeleting ? 'Excluindo...' : 'Sim, excluir minha conta'}
        confirmColor="error"
        onConfirm={handleDeleteAccount}
        loading={isDeleting}
      >
        <Typography variant="body1" sx={{ mb: 2 }}>
          Tem certeza que deseja excluir sua conta? Esta ação é <strong>irreversível</strong>.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Todos os seus dados serão permanentemente removidos, incluindo:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2, color: 'text.secondary' }}>
          <li>Informações pessoais</li>
          <li>Histórico de sessões</li>
          <li>Notificações</li>
          <li>Registros de auditoria</li>
        </Box>
      </Modal>
    </Box>
  );
}
