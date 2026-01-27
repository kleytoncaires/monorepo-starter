export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  actionUrl: string | null;
  createdAt: string;
}
