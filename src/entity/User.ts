import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Field, ObjectType, registerEnumType } from 'type-graphql';
import { MinLength, IsEmail } from 'class-validator';

export enum UserRoles {
  standard,
  admin,
}

registerEnumType(UserRoles, {
  name: 'UserRoles',
  description: 'Option for user roles',
});

@ObjectType()
@Entity('users')
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Column()
  @MinLength(4)
  password: string;

  @Field()
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column('int', { default: 0 })
  tokenVersion: number;

  @CreateDateColumn({ type: 'timestamp' })
  @Field()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @Field()
  lastUpdated: Date;

  @Column({ default: false })
  confirmed: boolean;

  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.standard })
  role: boolean;
}
