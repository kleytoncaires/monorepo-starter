import { NotificationType } from '../notifications.constants';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
}
