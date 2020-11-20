import ContactResolver, { PhoneNumberInput } from '@/resolvers/ContactResolver';
import { PhoneNumber, PhoneNumberType } from '../../src/entity/PhoneNumber';
import { testConnection } from '../config/testDatabaseConnection';
import { Connection } from 'typeorm';
import { ValidationError } from 'apollo-server-express';
import { PhoneNumberErrorMessage } from '@/models/Error';

describe('ContactResolver - buildUpdateProperties', () => {
  let contactResolver: ContactResolver;

  beforeEach(() => {
    contactResolver = new ContactResolver();
  });

  it('removes undefined keys from an object when buildUpdateProperties is called', () => {
    const objectWithUndefinedKeys = {
      hello: undefined,
      firstName: 'Ben',
      lastName: 'Bill',
    };
    const result = contactResolver.buildUpdateObject(objectWithUndefinedKeys);
    expect(result).toEqual({
      firstName: 'Ben',
      lastName: 'Bill',
    });
  });

  it('returns the object without changing keys when buildUpdateProperties is called on an object with no undefined properties', () => {
    const objectWithNoUndefinedKeys = {
      firstName: 'Ben',
      lastName: 'Bill',
    };
    const result = contactResolver.buildUpdateObject(objectWithNoUndefinedKeys);
    expect(result).toEqual(objectWithNoUndefinedKeys);
  });

  it('returns an empty object when buildUpdateProperties is called on an object with only undefined properties', () => {
    const objectWithOnlyUndefinedKeys = {
      firstName: undefined,
      lastName: undefined,
      email: undefined,
    };
    const result = contactResolver.buildUpdateObject(
      objectWithOnlyUndefinedKeys,
    );
    expect(result).toEqual({});
  });
});

describe('ContactResolver - createPhoneNumber', () => {
  let contactResolver: ContactResolver;
  let connection: Connection;

  beforeAll(async () => {
    connection = await testConnection();
  });

  beforeEach(async () => {
    contactResolver = new ContactResolver();
  });

  afterAll(async () => {
    await connection.close();
  });

  it('returns a PhoneNumber with the correct properties when createPhoneNumber is called when the value is a string of numbers', () => {
    const type = PhoneNumberType.home;
    const value = '02130123213';
    const phoneNumberInput = new PhoneNumberInput();
    phoneNumberInput.type = type;
    phoneNumberInput.value = value;
    const expectedResult = PhoneNumber.create({
      type,
      value,
    });
    expect(() => {
      contactResolver.createPhoneNumber(phoneNumberInput);
    }).not.toThrow();
    expect(contactResolver.createPhoneNumber(phoneNumberInput)).toEqual(
      expectedResult,
    );
  });

  it('throws an error when createPhoneNumber is called with a value that is not a string of numbers', () => {
    const type = PhoneNumberType.home;
    const value = '02F30123213';
    const phoneNumberInput = new PhoneNumberInput();
    phoneNumberInput.type = type;
    phoneNumberInput.value = value;
    expect(() => {
      contactResolver.createPhoneNumber(phoneNumberInput);
    }).toThrow();
  });

  it('throws a ValidationError when createPhoneNumber is called with a value that is not a string of numbers', () => {
    const type = PhoneNumberType.home;
    const value = '02F30123213';
    const phoneNumberInput = new PhoneNumberInput();
    phoneNumberInput.type = type;
    phoneNumberInput.value = value;
    const expectedError = new ValidationError(
      PhoneNumberErrorMessage.invalidNumber,
    );
    expect(() => {
      contactResolver.createPhoneNumber(phoneNumberInput);
    }).toThrowError(expectedError);
  });

  it('throws a ValidationError when createPhoneNumber is called with a value that is not a shorter than 10 characters in length', () => {
    const type = PhoneNumberType.home;
    const value = '012334';
    const phoneNumberInput = new PhoneNumberInput();
    phoneNumberInput.type = type;
    phoneNumberInput.value = value;
    const expectedError = new ValidationError(
      PhoneNumberErrorMessage.insufficientLength,
    );
    expect(() => {
      contactResolver.createPhoneNumber(phoneNumberInput);
    }).toThrowError(expectedError);
  });

  it('throws a ValidationError when createPhoneNumber is called with a value that is greater than 15 characters in length', () => {
    const type = PhoneNumberType.home;
    const value = '0123345678910111213';
    const phoneNumberInput = new PhoneNumberInput();
    phoneNumberInput.type = type;
    phoneNumberInput.value = value;
    const expectedError = new ValidationError(
      PhoneNumberErrorMessage.excessiveLength,
    );
    expect(() => {
      contactResolver.createPhoneNumber(phoneNumberInput);
    }).toThrowError(expectedError);
  });
});
