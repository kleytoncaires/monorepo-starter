import api from '@/services/api';
import type { Notification } from '@/types/notifications';
import type { PaginatedResponse, PaginationParams } from '@/types/api';

export const notificationsService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Notification>> => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  },

  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ count: number }> => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  delete: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  deleteAllRead: async (): Promise<{ count: number }> => {
    const response = await api.delete('/notifications');
    return response.data;
  },
};
