import { testConnection } from '@t/config/testDatabaseConnection';
import { Connection } from 'typeorm';
import { UserData } from '@t/models/user';
import { createUser, loginUser, registerUser } from '@t/helpers/user';

describe('UserResolver - Login Mutation', () => {
  let connection: Connection;
  let createdUser: UserData;

  beforeAll(async () => {
    connection = await testConnection();
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('user logins in with valid email and password', () => {
    beforeEach(async () => {
      createdUser = createUser();
      await registerUser(createdUser);
    });

    it('returns an access token of the correct length', async () => {
      const loginResponse = await loginUser({
        email: createdUser.email,
        password: createdUser.password,
      });
      const expectedAccessTokenLength = 192;
      expect(loginResponse.data?.login.accessToken).toHaveLength(
        expectedAccessTokenLength,
      );
    });

    it('returns the correct email, toLowerCase, for the logged in user', async () => {
      const loginResponse = await loginUser({
        email: createdUser.email,
        password: createdUser.password,
      });
      expect(loginResponse.data?.login.user.email).toEqual(
        createdUser.email.toLowerCase(),
      );
    });

    it('returns the correct firstName for the logged in user', async () => {
      const loginResponse = await loginUser({
        email: createdUser.email,
        password: createdUser.password,
      });
      expect(loginResponse.data?.login.user.firstName).toEqual(
        createdUser.firstName,
      );
    });

    it('returns the correct lastName for the logged in user', async () => {
      const loginResponse = await loginUser({
        email: createdUser.email,
        password: createdUser.password,
      });
      expect(loginResponse.data?.login.user.lastName).toEqual(
        createdUser.lastName,
      );
    });

    it('returns an id for the logged in user', async () => {
      const loginResponse = await loginUser({
        email: createdUser.email,
        password: createdUser.password,
      });
      expect(loginResponse.data?.login.user.id).toBeDefined();
    });
  });
});
