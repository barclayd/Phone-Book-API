import { LoginUser, UserData } from '@t/models/user';
import faker from 'faker';
import { setupGraphQL } from './setupGraphQL';
import { LoginMutation, registerMutation } from '@t/graphql/mutations/user';

export const randomNumber = (max = 9999999999999): number => {
  return Math.floor(Math.random() * Math.floor(max));
};

export const createUser = (): UserData => ({
  email: `${faker.name.firstName()}${faker.name.lastName()}${randomNumber()}@test.com`,
  password: faker.internet.password(4),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
});

export const registerUser = async (user: UserData) => {
  return await setupGraphQL({
    source: registerMutation,
    variableValues: user,
  });
};

export const loginUser = async (user: LoginUser) => {
  return await setupGraphQL({
    source: LoginMutation,
    variableValues: user,
  });
};
