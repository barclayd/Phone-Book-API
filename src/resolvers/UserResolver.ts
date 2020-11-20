import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { compare } from 'bcryptjs';
import { User } from '@/entity/User';
import { Context } from '@/models/context';
import { createAccessToken, createRefreshToken } from '../auth';
import { AuthenticationError } from 'apollo-server-express';
import { getConnection } from 'typeorm';
import { validate } from 'class-validator';
import { sendRefreshToken } from '@/auth/sendRefreshToken';
import { hashPassword } from '@/auth/password';
import { UserErrorMessage } from '@/models/Error';
import { ErrorService } from '@/services/ErrorService';

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}

@InputType()
class UserRegistrationInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  password: string;

  @Field()
  email: string;
}
@Resolver()
export default class UserResolver {
  @Query(() => User)
  userById(@Arg('id') id: string) {
    return User.findOne({ id });
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Mutation(() => LoginResponse, { nullable: true })
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() context: Context,
  ): Promise<LoginResponse | undefined> {
    try {
      const formatEmail = email.toLowerCase();
      const user = await User.findOne({ email: formatEmail });
      if (!user) {
        throw new AuthenticationError(UserErrorMessage.invalidCredentials);
      }

      const valid: boolean = await compare(password, user.password);

      if (!valid) {
        throw new AuthenticationError(UserErrorMessage.invalidCredentials);
      }

      sendRefreshToken(context, createRefreshToken(user, context.req));

      await User.save(user);

      return {
        accessToken: createAccessToken(user),
        user,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  logout(@Ctx() context: Context) {
    sendRefreshToken(context, '');
    return true;
  }

  @Mutation(() => Boolean)
  async revokeUserRefreshTokens(@Arg('id') id: string) {
    const user = await User.findOne({ where: { id } });
    if (user) {
      await getConnection()
        .getRepository(User)
        .increment({ id }, 'tokenVersion', 1);
      return true;
    }
    return false;
  }

  @Mutation(() => LoginResponse, { nullable: true })
  async register(
    @Arg('input', () => UserRegistrationInput) input: UserRegistrationInput,
  ) {
    try {
      let user = User.create(input);
      const errors = await validate(user);
      if (errors.length > 0) {
        throw new AuthenticationError(UserErrorMessage.invalidDetails);
      }
      const hashedPassword = await hashPassword(input.password);
      const userInput = {
        ...input,
        email: input.email.toLowerCase(),
        password: hashedPassword,
      };
      user = User.create(userInput);
      await user.save();

      return {
        accessToken: createAccessToken(user),
        user,
      };
    } catch (err) {
      console.log(err);
      if (new ErrorService(err).isUniqueError) {
        throw new AuthenticationError(UserErrorMessage.nonUniqueEmail);
      }
      console.log(err);
      throw err;
    }
  }

  @Mutation(() => Boolean)
  async deleteUser(@Arg('id') id: string) {
    await User.delete({ id });
    return true;
  }
}
