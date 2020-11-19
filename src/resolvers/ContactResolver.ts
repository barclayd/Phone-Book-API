import { Arg, Field, InputType, Mutation, Query, Resolver } from 'type-graphql';
import { PhoneNumber, PhoneNumberType } from '@/entity/PhoneNumber';
import { Address } from '@/entity/Address';
import { Contact } from '@/entity/Contact';

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
  email: string;

  @Field(() => [PhoneNumberInput], { nullable: true })
  phoneNumbers?: PhoneNumberInput[];

  @Field(() => [AddressInput], { nullable: true })
  addresses?: AddressInput[];
}

@Resolver()
export default class ContactResolver {
  @Mutation(() => Boolean)
  async createContact(
    @Arg('input') { email, addresses, phoneNumbers }: ContactRegistrationInput,
  ) {
    try {
      const contact = Contact.create({
        email,
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
      return false;
    }
  }

  @Query(() => [Contact])
  contacts() {
    return Contact.find({
      relations: ['address', 'phoneNumber'],
    });
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
