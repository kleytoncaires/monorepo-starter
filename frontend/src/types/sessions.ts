export interface Session {
  id: string;
  deviceName: string | null;
  ipAddress: string | null;
  lastUsedAt: string;
  createdAt: string;
}
