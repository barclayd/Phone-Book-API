import { testConnection } from '@t/config/testDatabaseConnection';
import { Connection } from 'typeorm';
import { User } from '@/entity/User';
import { verify } from 'jsonwebtoken';
import { ExecutionResult } from 'graphql';
import { UserData } from '@t/models/user';
import { compare } from 'bcryptjs';
import { createRandomUser, registerUser } from '@t/helpers/user';

describe('UserResolver - Register Mutation', () => {
  let connection: Connection;
  let randomUser: UserData;
  let createdUser: ExecutionResult;

  beforeAll(async () => {
    connection = await testConnection();
  });

  beforeEach(async () => {
    randomUser = createRandomUser();
    createdUser = await registerUser(randomUser);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('returns the correct user data upon a successful registration', async () => {
    expect(createdUser.data?.register.user.email).toEqual(
      randomUser.email.toLowerCase(),
    );
    expect(createdUser.data?.register.user.firstName).toEqual(
      randomUser.firstName,
    );
    expect(createdUser.data?.register.user.lastName).toEqual(
      randomUser.lastName,
    );
  });

  it('saves a user in the database upon a successful registration', async () => {
    const user = await User.findOne({
      where: { email: randomUser.email.toLowerCase() },
    });
    expect(user).toBeDefined();
  });

  it('registers a new user with the confirmed value of false', async () => {
    const user = await User.findOne({
      where: { email: randomUser.email.toLowerCase() },
    });
    expect(user?.confirmed).toEqual(false);
  });

  it('registers a new user with a token version of 0', async () => {
    const user = await User.findOne({
      where: { email: randomUser.email.toLowerCase() },
    });
    expect(user?.tokenVersion).toEqual(0);
  });

  it('returns an access token to a user upon successful registration', async () => {
    expect(createdUser.data?.register.accessToken.length).toBeGreaterThan(0);
  });

  it('registers a user with a hashed password that is not the same as the password provided by the user', async () => {
    const payload: any = verify(
      createdUser.data?.register.accessToken,
      process.env.ACCESS_TOKEN_SECRET!,
    );
    const user = await User.findOne({ where: { id: payload.userId } });
    expect(user?.password).not.toEqual(randomUser.password);
  });

  it("registers the user with a hashed password that is valid when compared with the user's provided password", async () => {
    const payload: any = verify(
      createdUser.data?.register.accessToken,
      process.env.ACCESS_TOKEN_SECRET!,
    );
    const user = await User.findOne({ where: { id: payload.userId } });
    const valid: boolean = await compare(randomUser.password, user!.password);
    expect(valid).toEqual(true);
  });

  it("returns an access token signed with the user's id upon successfully registering", async () => {
    const payload: any = verify(
      createdUser.data?.register.accessToken,
      process.env.ACCESS_TOKEN_SECRET!,
    );
    const user = await User.findOne({ where: { id: payload.userId } });
    expect(user?.email.toLowerCase()).toEqual(randomUser.email.toLowerCase());
  });
});
