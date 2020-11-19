import { Express, Response } from 'express';
import cookie from 'cookie';
import { verify } from 'jsonwebtoken';
import { User } from '@/entity/User';
import { sendRefreshToken } from '@/auth/sendRefreshToken';
import { createAccessToken, createRefreshToken } from '@/auth';
import cors from 'cors';
import { Context } from '@/models/context';

export class RouteService {
  constructor(private app: Express) {}

  private invalidRequest = (res: Response) => {
    res.send({
      ok: false,
      accessToken: '',
    });
  };

  private refreshToken() {
    this.app.post('/refresh_token', async (req, res) => {
      try {
        if (!req.headers.cookie) {
          throw new Error('No access token provided');
        }
        const { jid: refreshToken } = cookie.parse(
          req.headers.cookie as string,
        );

        if (!refreshToken) {
          return this.invalidRequest(res);
        }

        let payload: any = null;
        try {
          payload = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
        } catch (err) {
          console.log(err);
          return this.invalidRequest(res);
        }

        const user = await User.findOne({ id: payload.userId });

        if (!user) {
          return this.invalidRequest(res);
        }

        if (user.tokenVersion !== payload.tokenVersion) {
          return this.invalidRequest(res);
        }

        const context = { req, res } as Context;

        sendRefreshToken(context, createRefreshToken(user, context.req));

        return res.send({
          ok: true,
          accessToken: createAccessToken(user),
        });
      } catch (e) {
        console.log(e);
        return this.invalidRequest(res);
      }
    });
  }

  private setupCors() {
    this.app.use(
      cors({
        origin: 'http://localhost:3000',
        credentials: true,
      }),
    );
  }

  public register() {
    this.setupCors();
    this.refreshToken();
  }
}
