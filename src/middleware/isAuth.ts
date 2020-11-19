import { Context } from '@/models/context';
import { Request } from 'express';
import { verify } from 'jsonwebtoken';
import { User } from '@/entity/User';

export const findAndVerifyToken = (context: Context) => {
  try {
    const authorisation = context.req.headers['authorization'];
    if (!authorisation) {
      throw new Error('Not authenticated!');
    }
    const token = authorisation.split(' ')[1];
    return verify(token, process.env.ACCESS_TOKEN_SECRET!);
  } catch (error) {
    console.log(error);
    return;
  }
};

export const isApp = (req: Request): boolean => {
  const userAgent = req.headers['user-agent'] as string | undefined;
  if (!userAgent) {
    return false;
  }
  return userAgent.includes('iOS');
};

export const refreshTokenDayLifetime = (req: Request): number =>
  isApp(req) ? 60 : 7;

export const findUserFromCtxOrFail = async (context: Context) => {
  const payload: any = findAndVerifyToken(context);
  if (!payload) {
    throw new Error('Could not verify token');
  }
  return await User.findOneOrFail(payload.userId);
};

export const findUserFromCtx = async (context: Context) => {
  try {
    const payload: any = findAndVerifyToken(context);
    if (!payload) {
      throw new Error('Could not verify token');
    }
    const user = await User.findOne(payload.userId);
    if (!user) {
      throw new Error();
    }
    return user;
  } catch (error) {
    console.log(error);
    return;
  }
};
