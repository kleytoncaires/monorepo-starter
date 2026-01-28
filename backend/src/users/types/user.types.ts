import { Role } from '@prisma/client';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  isMaster: boolean;
  isActive: boolean;
  createdAt: Date;
}
