import { UserRole } from '../users/user.entity';

export interface JwtPayload {
  email: string;
  role: UserRole;
} 