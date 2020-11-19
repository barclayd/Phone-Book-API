import { Connection } from 'typeorm';
import { UserData } from '@t/models/user';
import { testConnection } from '@t/config/testDatabaseConnection';
import { User } from '@/entity/User';
import { setupGraphQL } from '@t/helpers/setupGraphQL';
import { meQuery } from '@t/graphql/queries/user';
import { createAccessToken } from '@/auth';
import { FoodStore } from '@/entity/FoodStore';
import { createRandomUser, registerUser } from '@t/helpers/user';

describe('User Resolver - Me Query', () => {
  let connection: Connection;
  let randomUser: UserData;

  const getMeQuery = async (accessToken?: string) => {
    return await setupGraphQL({
      source: meQuery,
      accessToken,
    });
  };

  const callMeQuery = async (withToken = true) => {
    const user = await User.create(randomUser).save();
    if (withToken) {
      const accessToken = createAccessToken(user);
      return await getMeQuery(accessToken);
    }
    return await getMeQuery();
  };

  beforeAll(async () => {
    connection = await testConnection();
  });

  beforeEach(async () => {
    randomUser = createRandomUser();
  });

  afterAll(async () => {
    await connection.close();
  });

  it("can retrieve a user's email", async () => {
    const response = await callMeQuery();
    expect(response.data?.me.email).toEqual(randomUser.email);
  });

  it("can retrieve a user's first name", async () => {
    const response = await callMeQuery();
    expect(response.data?.me.firstName).toEqual(randomUser.firstName);
  });

  it("can retrieve a user's last name", async () => {
    const response = await callMeQuery();
    expect(response.data?.me.lastName).toEqual(randomUser.lastName);
  });

  it("can retrieve the datetime at which the user's account was created", async () => {
    const response = await callMeQuery();
    expect(response.data?.me.createdAt.length).toEqual(24);
  });

  it('returns null when no access token is provided', async () => {
    const response = await callMeQuery(false);
    expect(response.data?.me).toEqual(null);
  });

  it('returns foodStores for a registered user', async () => {
    const { data } = await registerUser(randomUser);
    const response = await getMeQuery(data?.register.accessToken);
    expect(response.data?.me.foodStores).toBeDefined();
  });

  it('returns the correct list of foodStores for a newly registered user', async () => {
    const { data } = await registerUser(randomUser);
    const response = await getMeQuery(data?.register.accessToken);
    expect(response.data?.me.foodStores.length).toEqual(3);
  });

  it('returns a foodStore of type pantry for a newly registered user', async () => {
    const { data } = await registerUser(randomUser);
    const response = await getMeQuery(data?.register.accessToken);
    expect(
      response.data?.me.foodStores.filter(
        (foodStore: FoodStore) => foodStore.type.type === 'Pantry',
      ).length,
    ).toEqual(1);
  });

  it('returns a foodStore of type fridge for a newly registered user', async () => {
    const { data } = await registerUser(randomUser);
    const response = await getMeQuery(data?.register.accessToken);
    expect(
      response.data?.me.foodStores.filter(
        (foodStore: FoodStore) => foodStore.type.type === 'Fridge',
      ).length,
    ).toEqual(1);
  });

  it('returns a foodStore of type freezer for a newly registered user', async () => {
    const { data } = await registerUser(randomUser);
    const response = await getMeQuery(data?.register.accessToken);
    expect(
      response.data?.me.foodStores.filter(
        (foodStore: FoodStore) => foodStore.type.type === 'Freezer',
      ).length,
    ).toEqual(1);
  });
});
