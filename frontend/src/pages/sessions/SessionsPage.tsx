import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import { Smartphone, Monitor, Tablet, Trash2, LogOut } from 'lucide-react';
import { PageHeader, TableSkeleton, EmptyState, ConfirmModal } from '@/components';
import { sessionsService, Session } from '@/services/sessions.service';
import { useToast } from '@/contexts/ToastContext';
import { formatDate } from '@/utils/string.utils';

function getDeviceIcon(deviceName: string | null) {
  if (!deviceName) return Monitor;
  const name = deviceName.toLowerCase();
  if (name.includes('iphone') || name.includes('android')) return Smartphone;
  if (name.includes('ipad') || name.includes('tablet')) return Tablet;
  return Monitor;
}

export default function SessionsPage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; session: Session | null }>({
    open: false,
    session: null,
  });
  const [revokeAllDialog, setRevokeAllDialog] = useState(false);

  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['sessions'],
    queryFn: sessionsService.getAll,
  });

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => sessionsService.revoke(sessionId),
    onSuccess: () => {
      showSuccess('Sessão revogada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setRevokeDialog({ open: false, session: null });
    },
    onError: () => {
      showError('Erro ao revogar sessão.');
    },
  });

  const revokeAllMutation = useMutation({
    mutationFn: () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('Refresh token not found');
      return sessionsService.revokeAll(refreshToken);
    },
    onSuccess: data => {
      showSuccess(`${data.count} sessões revogadas com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setRevokeAllDialog(false);
    },
    onError: () => {
      showError('Erro ao revogar sessões.');
    },
  });

  const handleRevokeClick = (session: Session) => {
    setRevokeDialog({ open: true, session });
  };

  const handleRevokeConfirm = () => {
    if (revokeDialog.session) {
      revokeMutation.mutate(revokeDialog.session.id);
    }
  };

  const handleRevokeAllConfirm = () => {
    revokeAllMutation.mutate();
  };

  if (isLoading) {
    return (
      <Box>
        <PageHeader
          icon={Smartphone}
          title="Sessões Ativas"
          description="Gerencie seus dispositivos conectados"
        />
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <TableSkeleton rows={3} columns={4} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        icon={Smartphone}
        title="Sessões Ativas"
        description="Gerencie seus dispositivos conectados"
      />

      {error && (
        <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>
          Erro ao carregar sessões.
        </Alert>
      )}

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {sessions && sessions.length > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogOut size={18} />}
                onClick={() => setRevokeAllDialog(true)}
              >
                Encerrar outras sessões
              </Button>
            </Box>
          )}

          {!sessions || sessions.length === 0 ? (
            <EmptyState
              icon={Smartphone}
              title="Nenhuma sessão ativa"
              description="Você não possui sessões ativas no momento"
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sessions.map((session, index) => {
                const DeviceIcon = getDeviceIcon(session.deviceName);
                const isCurrentSession = index === 0;

                return (
                  <Box
                    key={session.id}
                    sx={{
                      alignItems: 'center',
                      bgcolor: isCurrentSession ? 'action.selected' : 'background.paper',
                      border: 1,
                      borderColor: isCurrentSession ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      display: 'flex',
                      gap: 2,
                      p: 2,
                    }}
                  >
                    <Box
                      sx={{
                        alignItems: 'center',
                        bgcolor: isCurrentSession ? 'primary.main' : 'action.hover',
                        borderRadius: 2,
                        color: isCurrentSession ? 'common.white' : 'text.secondary',
                        display: 'flex',
                        height: 48,
                        justifyContent: 'center',
                        width: 48,
                      }}
                    >
                      <DeviceIcon size={24} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
                        <Typography variant="body1" fontWeight={500}>
                          {session.deviceName || 'Dispositivo desconhecido'}
                        </Typography>
                        {isCurrentSession && (
                          <Typography
                            variant="caption"
                            sx={{
                              bgcolor: 'primary.main',
                              borderRadius: 1,
                              color: 'common.white',
                              fontWeight: 600,
                              px: 1,
                              py: 0.25,
                            }}
                          >
                            Sessão atual
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        IP: {session.ipAddress || 'Desconhecido'}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Última atividade: {formatDate(session.lastUsedAt)}
                      </Typography>
                    </Box>
                    {!isCurrentSession && (
                      <Tooltip title="Encerrar sessão">
                        <IconButton
                          onClick={() => handleRevokeClick(session)}
                          sx={{
                            color: 'text.secondary',
                            '&:hover': { color: 'error.main' },
                          }}
                        >
                          <Trash2 size={20} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        open={revokeDialog.open}
        onClose={() => setRevokeDialog({ open: false, session: null })}
        onConfirm={handleRevokeConfirm}
        title="Encerrar Sessão"
        subtitle="Esta ação desconectará o dispositivo"
        icon={Trash2}
        message={
          <>
            Tem certeza que deseja encerrar a sessão do dispositivo{' '}
            <strong>{revokeDialog.session?.deviceName || 'desconhecido'}</strong>?
          </>
        }
        confirmText={revokeMutation.isPending ? 'Encerrando...' : 'Encerrar'}
        loading={revokeMutation.isPending}
      />

      <ConfirmModal
        open={revokeAllDialog}
        onClose={() => setRevokeAllDialog(false)}
        onConfirm={handleRevokeAllConfirm}
        title="Encerrar Outras Sessões"
        subtitle="Esta ação desconectará todos os outros dispositivos"
        icon={LogOut}
        message="Tem certeza que deseja encerrar todas as outras sessões? Apenas esta sessão permanecerá ativa."
        confirmText={revokeAllMutation.isPending ? 'Encerrando...' : 'Encerrar todas'}
        loading={revokeAllMutation.isPending}
      />
    </Box>
  );
}
