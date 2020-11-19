import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
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
import { findAndVerifyToken } from '@/middleware/isAuth';
import { Brackets, getConnection } from 'typeorm';
import { validate } from 'class-validator';
import { sendRefreshToken } from '@/auth/sendRefreshToken';
import { verify, decode } from 'jsonwebtoken';
import { hashPassword } from '@/auth/password';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import { Token, UserTokenData } from '@/models/Token';
import { UserErrorMessage } from '@/models/Error';
import { ErrorService } from '@/services/ErrorService';

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}

@ObjectType()
export class UserStatsResponse {
  @Field(() => Int)
  foodsAdded: number;

  @Field(() => Int)
  percentageConsumed: number;

  @Field(() => Int)
  recentlyAdded: number;
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
      const user = await User.findOne(
        { email: formatEmail },
        { relations: ['foodStores', 'foodStores.type'] },
      );
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

  @Query(() => User, { nullable: true })
  async me(@Ctx() context: Context) {
    try {
      const payload: any = findAndVerifyToken(context);
      if (!payload) {
        throw new Error('No user id exists within the payload');
      }
      const user = await getConnection()
        .createQueryBuilder(User, 'user')
        .leftJoinAndSelect('user.foodStores', 'foodStore')
        .leftJoinAndSelect('foodStore.type', 'type')
        .leftJoinAndSelect('foodStore.collection', 'collection')
        .leftJoinAndSelect('collection.activities', 'activities')
        .leftJoinAndSelect('collection.food', 'food')
        .leftJoinAndSelect('food.brand', 'brand')
        .leftJoinAndSelect('food.measure', 'measure')
        .leftJoinAndSelect('food.hyperCategory', 'hyperCategory')
        .leftJoinAndSelect('hyperCategory.defaultStore', 'defaultStore')
        .leftJoinAndSelect('hyperCategory.expirationDate', 'expirationDate')
        .where('user.id = :user', { user: payload.userId })
        .andWhere(
          new Brackets((qb) => {
            qb.where(
              'collection.removed = false AND collection.consumed = false',
            ).orWhere('collection is NULL');
          }),
        )
        .getOne();

      if (!user) {
        throw new Error('User could not be retrieved');
      }
      return user;
    } catch (error) {
      console.log(error);
      return;
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
      if (new ErrorService(err).isUniqueError) {
        throw new AuthenticationError(UserErrorMessage.nonUniqueEmail);
      }
      console.log(err);
      throw err;
    }
  }

  @Mutation(() => Boolean, { nullable: true })
  async confirmUser(@Arg('token') token: string) {
    let payload: any = null;
    try {
      payload = verify(token, process.env.EMAIL_CONFIRMATION_SECRET!);
      if (!payload) {
        throw new AuthenticationError(UserErrorMessage.invalidToken);
      }
      const user = await User.findOne({ where: { id: payload.userId } });
      if (!user) {
        throw new AuthenticationError(UserErrorMessage.invalidToken);
      }
      if (user.confirmed) {
        throw new AuthenticationError(UserErrorMessage.alreadyConfirmed);
      }
      if (user.tokenVersion !== payload.tokenVersion) {
        throw new AuthenticationError(UserErrorMessage.invalidOperation);
      }
      await User.update(
        { id: user.id },
        {
          confirmed: true,
          tokenVersion: user.tokenVersion += 1,
        },
      );
      return true;
    } catch (e) {
      console.log(e);
      if (payload === null) {
        const decodedToken = decode(token) as Token | null;
        if (!decodedToken) {
          throw new AuthenticationError(UserErrorMessage.invalidToken);
        }
        const user = await User.findOne(decodedToken.userId);
        console.log(decodedToken, user);
        if (user?.confirmed) {
          throw new AuthenticationError(UserErrorMessage.alreadyConfirmed);
        }
        throw e;
      } else {
        throw e;
      }
    }
  }

  @Mutation(() => LoginResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() context: Context,
  ): Promise<LoginResponse | undefined> {
    let payload: any = null;
    try {
      payload = verify(token, process.env.EMAIL_FORGOTTEN_PASSWORD_SECRET!);
      if (!payload) {
        throw new Error('Invalid token');
      }
      const user = await User.findOne(payload.userId);

      if (!user) {
        throw new Error('Invalid token');
      }

      if (user.tokenVersion !== payload.tokenVersion) {
        throw new Error('Invalid operation');
      }

      user.password = newPassword;

      const errors = await validate(user);
      if (errors.length > 0) {
        throw new Error('Password does not meet validation requirements');
      }

      user.password = await hashPassword(newPassword);
      user.tokenVersion = user.tokenVersion += 1;

      sendRefreshToken(context, createRefreshToken(user, context.req));
      await user.save();
      return {
        accessToken: createAccessToken(user),
        user,
      };
    } catch (e) {
      console.log(e);
      return;
    }
  }

  private async findUserDataFromToken(
    token: string,
  ): Promise<UserTokenData | undefined> {
    try {
      const payload = verify(
        token,
        process.env.EMAIL_FORGOTTEN_PASSWORD_SECRET!,
      ) as Token | undefined;
      if (!payload) {
        throw new Error('Invalid token');
      }
      const user = await User.findOneOrFail(payload.userId);
      return {
        user,
        payload,
      };
    } catch (e) {
      return;
    }
  }

  @Query(() => Boolean)
  async validateResetToken(@Arg('token') token: string) {
    const userData = await this.findUserDataFromToken(token);
    if (!userData) {
      return false;
    }
    return userData.user.tokenVersion === userData.payload.tokenVersion;
  }

  @Query(() => String, { nullable: true })
  async findEmailFromToken(@Arg('token') token: string) {
    try {
      const userData = await this.findUserDataFromToken(token);
      if (!userData) {
        return;
      }
      return userData.user.email;
    } catch (e) {
      console.log(e);
      return;
    }
  }

  @Mutation(() => Boolean)
  async addProfilePicture(
    @Arg('picture', () => GraphQLUpload)
    { createReadStream, filename }: FileUpload,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      return createReadStream()
        .pipe(createWriteStream(__dirname + `/../images/${filename}`))
        .on('finish', () => resolve(true))
        .on('error', (err) => (console.log(err) as any) || reject(false));
    });
  }

  @Mutation(() => Boolean)
  async deleteUser(@Arg('id') id: string) {
    await User.delete({ id });
    return true;
  }
}
