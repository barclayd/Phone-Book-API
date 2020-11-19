import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';
import { Contact } from '@/entity/Contact';

@ObjectType()
@Entity()
export class Address extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ default: false })
  isBusiness: boolean;

  @Field()
  @Column()
  streetAddress: string;

  @Field()
  @Column()
  postalTown: string;

  @Field()
  @Column()
  postcode: string;

  @Field()
  @Column()
  country: string;

  @CreateDateColumn({ type: 'timestamp' })
  @Field()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @Field()
  lastUpdated: Date;

  @Field(() => Contact)
  @ManyToOne(() => Contact, (contact) => contact.address, {
    primary: true,
  })
  @JoinColumn()
  contact: Contact;
}
