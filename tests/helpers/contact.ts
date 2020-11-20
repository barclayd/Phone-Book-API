import { ContactData } from '../models/contact';
import faker from 'faker';
import { setupGraphQL } from './setupGraphQL';
import { CreateContactMutation } from '../graphql/mutations/user';

export const randomNumber = (max = 9999999999999): number => {
  return Math.floor(Math.random() * Math.floor(max));
};

export const generateContact = (): ContactData => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: `${faker.name.firstName()}${faker.name.lastName()}${randomNumber()}@test.com`,
  streetAddress: faker.address.streetAddress(),
  postalTown: faker.address.city(),
  postcode: faker.address.zipCode(),
  country: faker.address.country(),
});

export const createContact = async (
  contact: ContactData,
  accessToken: string,
) => {
  return await setupGraphQL({
    source: CreateContactMutation,
    variableValues: contact,
    accessToken,
  });
};
