import { User } from '@/entity/User';
import { sign } from 'jsonwebtoken';
import { Request } from 'express';
import { refreshTokenDayLifetime } from '@/middleware/isAuth';

export const createAccessToken = (user: User) =>
  sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: '15m',
  });

export const createRefreshToken = (user: User, req: Request) =>
  sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: `${refreshTokenDayLifetime(req)}d`,
    },
  );
