import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { FileText, Calendar, User as UserIcon, Monitor } from 'lucide-react';
import { PageHeader, DataTable, TableSkeleton, EmptyState, Pagination, type Column } from '@/components';
import { auditService, AuditLog, ACTION_LABELS } from '@/services/audit.service';
import { formatDate } from '@/utils/string.utils';

const ACTION_COLORS: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  LOGIN: 'success',
  LOGOUT: 'default',
  REGISTER: 'info',
  PASSWORD_CHANGE: 'warning',
  PASSWORD_RESET: 'warning',
  EMAIL_VERIFIED: 'success',
  USER_CREATE: 'info',
  USER_UPDATE: 'info',
  USER_DELETE: 'error',
  STATUS_TOGGLE: 'warning',
  SESSION_REVOKE: 'warning',
};

export default function AuditLogsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [actionFilter, setActionFilter] = useState('');

  const { data: actionTypes } = useQuery({
    queryKey: ['audit-action-types'],
    queryFn: auditService.getActionTypes,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['audit-logs', { page, limit, action: actionFilter || undefined }],
    queryFn: () => auditService.getAll({ page, limit, action: actionFilter || undefined }),
  });

  const logs = data?.data ?? [];
  const meta = data?.meta;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'action',
      label: 'Ação',
      render: log => (
        <Chip
          label={ACTION_LABELS[log.action] || log.action}
          color={ACTION_COLORS[log.action] || 'default'}
          size="small"
        />
      ),
    },
    {
      key: 'user',
      label: 'Usuário',
      render: log => (
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
          <UserIcon size={16} />
          <Typography variant="body2">
            {log.user?.name || 'Sistema'}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'details',
      label: 'Detalhes',
      render: log => (
        <Box>
          {log.entity && (
            <Typography variant="caption" color="text.secondary">
              {log.entity} {log.entityId ? `#${log.entityId.slice(0, 8)}...` : ''}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'ipAddress',
      label: 'IP',
      render: log => (
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
          <Monitor size={16} />
          <Typography variant="body2" color="text.secondary">
            {log.ipAddress || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'createdAt',
      label: 'Data',
      render: log => (
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
          <Calendar size={16} />
          <Typography variant="body2" color="text.secondary">
            {formatDate(log.createdAt)}
          </Typography>
        </Box>
      ),
    },
  ];

  const renderMobileCard = (log: AuditLog) => (
    <Box
      key={log.id}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        py: 2,
        '&:last-child': { borderBottom: 0 },
      }}
    >
      <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, mb: 1 }}>
            <Chip
              label={ACTION_LABELS[log.action] || log.action}
              color={ACTION_COLORS[log.action] || 'default'}
              size="small"
            />
          </Box>
          <Typography variant="body2" fontWeight={500}>
            {log.user?.name || 'Sistema'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {log.user?.email}
          </Typography>
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 2, mt: 1 }}>
            <Typography variant="caption" color="text.disabled">
              {log.ipAddress || '-'}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {formatDate(log.createdAt)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  if (isLoading) {
    return (
      <Box>
        <PageHeader
          icon={FileText}
          title="Logs de Auditoria"
          description="Histórico de ações do sistema"
        />
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <TableSkeleton rows={5} columns={5} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        icon={FileText}
        title="Logs de Auditoria"
        description="Histórico de ações do sistema"
      />

      {error && (
        <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>
          Erro ao carregar logs de auditoria.
        </Alert>
      )}

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              select
              label="Filtrar por ação"
              value={actionFilter}
              onChange={e => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Todas as ações</MenuItem>
              {actionTypes?.map(action => (
                <MenuItem key={action} value={action}>
                  {ACTION_LABELS[action] || action}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {logs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nenhum log encontrado"
              description="Não há registros de auditoria para exibir"
            />
          ) : isMobile ? (
            <>
              <Box>{logs.map(renderMobileCard)}</Box>
              {meta && (
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  total={meta.total}
                  limit={meta.limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              )}
            </>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={logs}
                keyExtractor={log => log.id}
              />
              {meta && (
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  total={meta.total}
                  limit={meta.limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
