import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  registerEnumType,
  Resolver,
} from 'type-graphql';
import { PhoneNumber, PhoneNumberType } from '@/entity/PhoneNumber';
import { Address } from '@/entity/Address';
import { Contact } from '@/entity/Contact';
import { Context } from '@/models/context';
import { findUserFromCtx } from '@/middleware/isAuth';
import { AuthenticationError } from 'apollo-server-express';
import { ContactErrorMessage } from '@/models/Error';
import { getConnection } from 'typeorm';

@ObjectType()
class ContactsQuery {
  @Field(() => [Contact])
  contacts: Contact[];

  @Field(() => Int)
  count: number;
}

@InputType()
class PhoneNumberInput {
  @Field()
  value: string;

  @Field(() => PhoneNumberType)
  type: PhoneNumberType;
}

@InputType()
class AddressInput {
  @Field()
  streetAddress: string;

  @Field()
  postalTown: string;

  @Field()
  postcode: string;

  @Field()
  country: string;
}

@InputType()
class ContactUpdateInput {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  email?: string;
}

@InputType()
class ContactRegistrationInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field(() => [PhoneNumberInput], { nullable: true })
  phoneNumbers?: PhoneNumberInput[];

  @Field(() => [AddressInput], { nullable: true })
  addresses?: AddressInput[];
}

export enum ContactSortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(ContactSortOrder, {
  name: 'ContactSortOrder',
  description: 'Supported sort options for contacts',
});

@Resolver()
export default class ContactResolver {
  @Mutation(() => Boolean)
  async createContact(
    @Arg('input')
    {
      email,
      addresses,
      phoneNumbers,
      firstName,
      lastName,
    }: ContactRegistrationInput,
    @Ctx() context: Context,
  ) {
    try {
      const user = await findUserFromCtx(context);
      if (!user) {
        throw new AuthenticationError(
          ContactErrorMessage.authenticationRequired,
        );
      }
      const contact = Contact.create({
        email,
        firstName,
        lastName,
        creator: user,
      });
      contact.address =
        addresses?.map((address) => Address.create(address)) ?? [];
      contact.phoneNumber =
        phoneNumbers?.map((phoneNumber) => PhoneNumber.create(phoneNumber)) ??
        [];
      await contact.save();
      return true;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Query(() => ContactsQuery)
  async contacts(
    @Arg('sortOrder', () => ContactSortOrder, { nullable: true })
    sortOrder: ContactSortOrder | undefined,
    @Arg('skip', () => Int, { nullable: true })
    skip: number | undefined,
    @Arg('take', () => Int, { nullable: true })
    take: number | undefined,
    @Ctx() context: Context,
  ) {
    const user = await findUserFromCtx(context);
    if (!user) {
      throw new AuthenticationError(ContactErrorMessage.authenticationRequired);
    }
    const contactSortOrder = sortOrder ?? ContactSortOrder.ASC;
    const contactsQuery = await getConnection()
      .createQueryBuilder(Contact, 'contact')
      .leftJoinAndSelect('contact.address', 'address')
      .leftJoinAndSelect('contact.phoneNumber', 'phoneNumber')
      .leftJoinAndSelect('contact.creator', 'creator')
      .where('contact.creator = :user', { user: user.id })
      .skip(skip)
      .take(take)
      .orderBy({
        'contact.lastName': contactSortOrder,
      })
      .getManyAndCount();

    const [contacts, count] = contactsQuery;
    return {
      contacts,
      count,
    } as ContactsQuery;
  }

  public buildUpdateObject(input: any) {
    return Object.keys(input).reduce((acc, inputKey) => {
      if (input[inputKey] !== undefined) {
        acc = {
          ...acc,
          [inputKey]: input[inputKey],
        };
      }
      return acc;
    }, {});
  }

  @Mutation(() => Boolean)
  async updateContactById(
    @Arg('id') id: number,
    @Arg('input', () => ContactUpdateInput) input: ContactUpdateInput,
  ) {
    try {
      const updatedProperties = this.buildUpdateObject(input);
      await getConnection()
        .createQueryBuilder()
        .update(Contact)
        .set(updatedProperties)
        .where('id = :id', { id })
        .execute();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  @Mutation(() => Boolean)
  async deleteContact(@Arg('id', () => Int) id: number) {
    try {
      await Contact.delete(id);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
