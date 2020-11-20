import { testConnection } from '@t/config/testDatabaseConnection';
import { Connection } from 'typeorm';
import { ExecutionResult } from 'graphql';
import { UserData } from '@t/models/user';
import { createUser, registerUser } from '@t/helpers/user';
import { createContact, generateContact } from '../../helpers/contact';
import { ContactData } from '../../models/contact';
import { AuthenticationError } from 'apollo-server-express';
import { ContactErrorMessage } from '../../../src/models/Error';

describe('ContactResolver - CreateContact', () => {
  let connection: Connection;
  let user: UserData;
  let contact: ContactData;
  let createdUser: ExecutionResult;
  let createdContact: ExecutionResult;

  beforeAll(async () => {
    connection = await testConnection();
  });

  beforeEach(async () => {
    user = createUser();
    contact = generateContact();
    createdUser = await registerUser(user);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('returns an authentication error when contactCreation is called without a valid accessToken', async () => {
    createdContact = await createContact(contact, '');
    const expectedError = new AuthenticationError(
      ContactErrorMessage.authenticationRequired,
    );
    expect(createdContact.errors).toEqual([expectedError]);
  });

  it('returns true when a contact is created successfully', async () => {
    createdContact = await createContact(
      contact,
      createdUser.data?.register.accessToken,
    );
    expect(createdContact.data?.createContact).toEqual(true);
  });
});
