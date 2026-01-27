import api from '@/services/api';
import type { Session } from '@/types/sessions';

export const sessionsService = {
  getAll: async (): Promise<Session[]> => {
    const response = await api.get('/auth/sessions');
    return response.data;
  },

  revoke: async (sessionId: string): Promise<void> => {
    await api.delete(`/auth/sessions/${sessionId}`);
  },

  revokeAll: async (refreshToken: string): Promise<{ count: number }> => {
    const response = await api.delete('/auth/sessions', { data: { refreshToken } });
    return response.data;
  },
};
