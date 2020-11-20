import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
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
  ascending = 'ASC',
  descending = 'DESC',
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

  @Query(() => [Contact])
  async contacts(
    @Arg('sortOrder', () => ContactSortOrder, { nullable: true })
    sortOrder: ContactSortOrder | undefined,
    @Ctx() context: Context,
  ) {
    const user = await findUserFromCtx(context);
    if (!user) {
      throw new AuthenticationError(ContactErrorMessage.authenticationRequired);
    }
    const contactSortOrder = sortOrder ?? ContactSortOrder.ascending;
    return await getConnection()
      .createQueryBuilder(Contact, 'contact')
      .leftJoinAndSelect('contact.address', 'address')
      .leftJoinAndSelect('contact.phoneNumber', 'phoneNumber')
      .leftJoinAndSelect('contact.creator', 'creator')
      .where('contact.creator = :user', { user: user.id })
      .orderBy({
        'contact.lastName': contactSortOrder,
      })
      .getMany();
    // return Contact.find({
    //   where: {
    //     creator: user,
    //   },
    //   relations: ['address', 'phoneNumber', 'creator'],
    // });
  }

  @Mutation(() => Boolean)
  async deleteContact(@Arg('email') email: string) {
    try {
      await Contact.delete({ email });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
