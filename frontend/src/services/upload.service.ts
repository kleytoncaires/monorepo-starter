import api from '@/services/api';
import type { UploadResponse } from '@/types/upload';

export const uploadService = {
  uploadAvatar: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  removeAvatar: async (): Promise<void> => {
    await api.delete('/upload/avatar');
  },
};
