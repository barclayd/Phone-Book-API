import { User } from '@/entity/User';

export interface Token {
  userId: string;
  tokenVersion: number;
  iat: number;
  exp: number;
}

export interface UserTokenData {
  user: User;
  payload: Token;
}
