import { Context } from '@/models/context';
import { refreshTokenDayLifetime } from '@/middleware/isAuth';

export const sendRefreshToken = ({ req, res }: Context, token: string) => {
  const REFRESH_TOKEN = 'jid';
  const REFRESH_TOKEN_DAY_EXPIRY = refreshTokenDayLifetime(req);
  res.cookie(REFRESH_TOKEN, token, {
    httpOnly: true,
    path: '/refresh_token',
    expires: new Date(Date.now() + 3600000 * 24 * REFRESH_TOKEN_DAY_EXPIRY),
  });
};
