import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';
import { IsEmail } from 'class-validator';
import { PhoneNumber } from '@/entity/PhoneNumber';
import { Address } from '@/entity/Address';
import { User } from '@/entity/User';

@ObjectType()
@Entity()
export class Contact extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  @IsEmail()
  email: string;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @CreateDateColumn({ type: 'timestamp' })
  @Field()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @Field()
  lastUpdated: Date;

  @Field(() => [PhoneNumber])
  @OneToMany(() => PhoneNumber, (phoneNumber) => phoneNumber.contact, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  phoneNumber: PhoneNumber[];

  @Field(() => [Address])
  @OneToMany(() => Address, (address) => address.contact, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  address: Address[];

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.contacts, {
    cascade: true,
  })
  creator: User;
}
