import { hash } from 'bcryptjs';

export const hashPassword = async (password: string) =>
  await hash(password, 12);
