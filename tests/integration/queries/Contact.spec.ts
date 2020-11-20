import { testConnection } from '@t/config/testDatabaseConnection';
import { Connection } from 'typeorm';
import { ExecutionResult } from 'graphql';
import { createUser, registerUser } from '@t/helpers/user';
import {
  createContact,
  generateContact,
  getContacts,
} from '@t/helpers/contact';
import { ContactData, ContactOptions } from '@t/models/contact';
import { ContactSortOrder } from '@/resolvers/ContactResolver';

describe('ContactResolver - Contacts Query', () => {
  let connection: Connection;
  let contact1: ContactData;
  let contact2: ContactData;
  let createdUser: ExecutionResult;

  beforeAll(async () => {
    connection = await testConnection();
  });

  beforeEach(async () => {
    createdUser = await registerUser(createUser());
    contact1 = generateContact('Adam', 'Adams');
    contact2 = generateContact('Zed', 'Zaid');
    await createContact(contact1, createdUser.data?.register.accessToken);
    await createContact(contact2, createdUser.data?.register.accessToken);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('returns the contacts created by the user', async () => {
    const contacts = await getContacts(
      undefined,
      createdUser.data?.register.accessToken,
    );
    expect(contacts.data?.contacts.contacts).toHaveLength(2);
  });

  it('returns the correct number of contacts created by the user when take option is not specified', async () => {
    const contacts = await getContacts(
      undefined,
      createdUser.data?.register.accessToken,
    );
    expect(contacts.data?.contacts.count).toEqual(2);
  });

  it('returns the correct number of contacts as specified by take property when defined', async () => {
    const takeNumber = 1;
    const options: ContactOptions = {
      take: takeNumber,
    };
    const contacts = await getContacts(
      options,
      createdUser.data?.register.accessToken,
    );
    expect(contacts.data?.contacts.contacts).toHaveLength(takeNumber);
  });

  it('returns the correct number of contacts when the skip property is defined', async () => {
    const skip = 1;
    const options: ContactOptions = {
      skip,
    };
    const contacts = await getContacts(
      options,
      createdUser.data?.register.accessToken,
    );
    const expectedContactsNumber = contacts.data!.contacts.count - skip;
    expect(contacts.data?.contacts.contacts).toHaveLength(
      expectedContactsNumber,
    );
  });

  it('returns the contacts sorted by ascending order when no sort option is specified', async () => {
    const contacts = await getContacts(
      undefined,
      createdUser.data?.register.accessToken,
    );
    const contactsLastNames: string[] = contacts.data?.contacts.contacts.map(
      (contact: any) => contact.lastName,
    );
    expect(contactsLastNames).toEqual(['Adams', 'Zaid']);
  });

  it('returns the contacts sorted by descending order when descending sort option is specified', async () => {
    const contacts = await getContacts(
      {
        sortOrder: ContactSortOrder.DESC,
      },
      createdUser.data?.register.accessToken,
    );
    const contactsLastNames: string[] = contacts.data?.contacts.contacts.map(
      (contact: any) => contact.lastName,
    );
    expect(contactsLastNames).toEqual(['Zaid', 'Adams']);
  });

  it('returns the contacts sorted by ascending order when ascending sort option is specified', async () => {
    const contacts = await getContacts(
      {
        sortOrder: ContactSortOrder.ASC,
      },
      createdUser.data?.register.accessToken,
    );
    const contactsLastNames: string[] = contacts.data?.contacts.contacts.map(
      (contact: any) => contact.lastName,
    );
    expect(contactsLastNames).toEqual(['Adams', 'Zaid']);
  });
});
