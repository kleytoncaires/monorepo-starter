import api from '@/services/api';
import type { AuditLog, AuditLogParams } from '@/types/audit';
import type { PaginatedResponse } from '@/types/api';

export const auditService = {
  getAll: async (params?: AuditLogParams): Promise<PaginatedResponse<AuditLog>> => {
    const response = await api.get('/audit-logs', { params });
    return response.data;
  },

  getActionTypes: async (): Promise<string[]> => {
    const response = await api.get('/audit-logs/actions');
    return response.data;
  },
};

export const ACTION_LABELS: Record<string, string> = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  REGISTER: 'Cadastro',
  PASSWORD_CHANGE: 'Alteração de senha',
  PASSWORD_RESET: 'Redefinição de senha',
  EMAIL_VERIFIED: 'Email verificado',
  USER_CREATE: 'Usuário criado',
  USER_UPDATE: 'Usuário atualizado',
  USER_DELETE: 'Usuário excluído',
  STATUS_TOGGLE: 'Status alterado',
  SESSION_REVOKE: 'Sessão revogada',
};
