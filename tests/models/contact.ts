import { PhoneNumberType } from '../../src/entity/PhoneNumber';

export interface ContactData extends AddressData {
  email: string;
  phoneNumbers?: PhoneNumberData;
}

export interface AddressData {
  streetAddress: string;
  postalTown: string;
  postcode: string;
  country: string;
}

export interface PhoneNumberData {
  value: string;
  type: PhoneNumberType;
}
