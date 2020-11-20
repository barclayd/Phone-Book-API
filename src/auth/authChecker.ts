import { AuthChecker } from 'type-graphql';
import { findUserFromCtx } from '@/middleware/isAuth';
import { Context } from '@/models/context';

export const authChecker: AuthChecker<Context> = async ({ context }, roles) => {
  const user = await findUserFromCtx(context);
  if (!user) {
    console.log('No user found');
    return false;
  }
  if (roles.length < 1) {
    return true;
  }

  return roles.map((role) => String(role)).includes(String(user.role));
};
