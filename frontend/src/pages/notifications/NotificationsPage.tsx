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
import { Bell, Trash2, Check, CheckCheck, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { PageHeader, TableSkeleton, EmptyState, Pagination } from '@/components';
import { notificationsService } from '@/services/notifications.service';
import { useToast } from '@/contexts/ToastContext';
import { formatDate } from '@/utils/string.utils';

const TYPE_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const TYPE_COLORS = {
  info: 'info.main',
  success: 'success.main',
  warning: 'warning.main',
  error: 'error.main',
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', { page, limit }],
    queryFn: () => notificationsService.getAll({ page, limit }),
  });

  const notifications = data?.data ?? [];
  const meta = data?.meta;

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
    onError: () => {
      showError('Erro ao marcar notificação como lida.');
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: data => {
      showSuccess(`${data.count} notificações marcadas como lidas!`);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
    onError: () => {
      showError('Erro ao marcar notificações como lidas.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsService.delete(notificationId),
    onSuccess: () => {
      showSuccess('Notificação excluída!');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
    onError: () => {
      showError('Erro ao excluir notificação.');
    },
  });

  const deleteAllReadMutation = useMutation({
    mutationFn: notificationsService.deleteAllRead,
    onSuccess: data => {
      showSuccess(`${data.count} notificações excluídas!`);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      showError('Erro ao excluir notificações.');
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <Box>
        <PageHeader
          icon={Bell}
          title="Notificações"
          description="Suas notificações e alertas"
        />
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <TableSkeleton rows={5} columns={3} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        icon={Bell}
        title="Notificações"
        description="Suas notificações e alertas"
      />

      {error && (
        <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>
          Erro ao carregar notificações.
        </Alert>
      )}

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {notifications.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 3 }}>
              {unreadCount > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<CheckCheck size={18} />}
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  Marcar todas como lidas
                </Button>
              )}
              <Button
                variant="outlined"
                color="error"
                startIcon={<Trash2 size={18} />}
                onClick={() => deleteAllReadMutation.mutate()}
                disabled={deleteAllReadMutation.isPending}
              >
                Excluir lidas
              </Button>
            </Box>
          )}

          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Nenhuma notificação"
              description="Você não possui notificações no momento"
            />
          ) : (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {notifications.map(notification => {
                  const TypeIcon = TYPE_ICONS[notification.type] || Info;
                  const typeColor = TYPE_COLORS[notification.type] || 'info.main';

                  return (
                    <Box
                      key={notification.id}
                      sx={{
                        alignItems: 'flex-start',
                        bgcolor: notification.read ? 'transparent' : 'action.hover',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        display: 'flex',
                        gap: 2,
                        p: 2,
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <Box sx={{ color: typeColor, mt: 0.5 }}>
                        <TypeIcon size={20} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={notification.read ? 400 : 600}>
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Box
                              sx={{
                                bgcolor: 'primary.main',
                                borderRadius: '50%',
                                height: 8,
                                width: 8,
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {!notification.read && (
                          <Tooltip title="Marcar como lida">
                            <IconButton
                              size="small"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              disabled={markAsReadMutation.isPending}
                            >
                              <Check size={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={() => deleteMutation.mutate(notification.id)}
                            disabled={deleteMutation.isPending}
                            sx={{ '&:hover': { color: 'error.main' } }}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              {meta && (
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  total={meta.total}
                  limit={meta.limit}
                  onPageChange={setPage}
                  onLimitChange={newLimit => {
                    setLimit(newLimit);
                    setPage(1);
                  }}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
