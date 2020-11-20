import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Field, Int, ObjectType, registerEnumType } from 'type-graphql';
import { Validate } from 'class-validator';
import { isStringOfNumbers } from '@/validators/IsStringOfNumbers';
import { Contact } from '@/entity/Contact';

export enum PhoneNumberType {
  work = 'work',
  home = 'home',
  mobile = 'mobile',
  other = 'other',
}

registerEnumType(PhoneNumberType, {
  name: 'PhoneNumberType',
  description: 'Supported phone number types',
});

@ObjectType()
@Entity()
export class PhoneNumber extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ nullable: true })
  @Validate(isStringOfNumbers)
  value: string;

  @Field(() => PhoneNumberType)
  @Column({ type: 'enum', enum: PhoneNumberType })
  type: PhoneNumberType;

  @Field(() => Contact, { nullable: true })
  @ManyToOne(() => Contact, (contact) => contact.phoneNumber, {
    nullable: true,
  })
  @JoinColumn()
  contact: Contact;
}
