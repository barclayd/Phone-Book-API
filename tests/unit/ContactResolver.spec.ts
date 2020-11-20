import ContactResolver from '../../src/resolvers/ContactResolver';

describe('ContactResolver', () => {
  it('removes undefined keys from an object when buildUpdateProperties is called', () => {
    const objectWithUndefinedKeys = {
      hello: undefined,
      firstName: 'Ben',
      lastName: 'Bill',
    };
    const result = new ContactResolver().buildUpdateObject(
      objectWithUndefinedKeys,
    );
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
    const result = new ContactResolver().buildUpdateObject(
      objectWithNoUndefinedKeys,
    );
    expect(result).toEqual(objectWithNoUndefinedKeys);
  });

  it('returns an empty object when buildUpdateProperties is called on an object with only undefined properties', () => {
    const objectWithOnlyUndefinedKeys = {
      firstName: undefined,
      lastName: undefined,
      email: undefined,
    };
    const result = new ContactResolver().buildUpdateObject(
      objectWithOnlyUndefinedKeys,
    );
    expect(result).toEqual({});
  });
});
