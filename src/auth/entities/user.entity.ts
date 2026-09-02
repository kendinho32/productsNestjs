import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { v7 as uuid } from 'uuid';
import { Product } from '../../products/entities';

@Entity('users')
export class User {
  @ApiProperty({
    format: 'uuid',
    description: 'Unique product identifier (UUID v7)',
    example: '01918a5f-55cc-7d1a-85d8-372093e83ba5',
  })
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Email address',
    uniqueItems: true,
    example: 'test@gmail.com',
  })
  @Column('text', { unique: true, nullable: false })
  email: string;

  @ApiProperty({
    description: 'Password',
    example: '1234567',
  })
  @Column('text', { nullable: false, select: false })
  password: string;

  @ApiProperty({
    description: 'Name',
    example: 'Mrs Pedro',
  })
  @Column('text', { nullable: false })
  full_name: string;

  @ApiProperty({
    description: 'representative is active or not',
    example: 'true || false',
  })
  @Column('boolean', { default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Roles for user',
    example: ['admin', 'visit', 'user'],
    type: [String],
  })
  @Column('text', { array: true, default: ['user'] })
  roles: string[];

  @ApiProperty({
    description: 'Relation with product',
    type: [Product],
    required: false,
  })
  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @BeforeInsert()
  runBeforeInsert() {
    this.generateId();
    this.checkFieldsBeforeInsert();
  }

  @BeforeUpdate()
  runBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }

  generateId() {
    if (!this.id) {
      this.id = uuid();
    }
  }

  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }
}
