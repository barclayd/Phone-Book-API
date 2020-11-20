import { PhoneNumberType } from '@/entity/PhoneNumber';
import { ContactSortOrder } from '@/resolvers/ContactResolver';

export interface ContactData extends AddressData {
  firstName: string;
  lastName: string;
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

export interface ContactOptions {
  sortOrder?: ContactSortOrder;
  take?: number;
  skip?: number;
}

export interface ContactDeleteOptions {
  id: number;
}
