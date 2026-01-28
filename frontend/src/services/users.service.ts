import api from '@/services/api';
import type { User } from '@/types/auth';
import type { PaginatedResponse, PaginationParams } from '@/types/api';

export const usersService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  exportMyData: async () => {
    const response = await api.get('/users/me/export');
    return response.data;
  },

  deleteMyAccount: async (): Promise<void> => {
    await api.delete('/users/me');
  },

  transferMaster: async (newMasterId: string): Promise<User> => {
    const response = await api.patch(`/users/${newMasterId}/transfer-master`);
    return response.data;
  },
};
