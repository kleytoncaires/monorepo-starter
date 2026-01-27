export interface NotificationDto {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  readAt: Date | null;
  actionUrl: string | null;
  createdAt: Date;
}
