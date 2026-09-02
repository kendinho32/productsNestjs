import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { v7 as uuid } from 'uuid';
import { ProductImage } from './product-image.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('products')
export class Product {
  @ApiProperty({
    format: 'uuid',
    description: 'Unique product identifier (UUID v7)',
    example: '01918a5f-55cc-7d1a-85d8-372093e83ba5',
  })
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Product title',
    uniqueItems: true,
    example: 'Teslo Hoodie',
  })
  @Column('text', { unique: true, nullable: false })
  title: string;

  @ApiProperty({
    description: 'Product price',
    default: 0,
    example: 29.99,
  })
  @Column('float', { nullable: false, default: 0 })
  price: number;

  @ApiProperty({
    description: 'Product description',
    nullable: true,
    example: 'A warm and comfortable hoodie for all seasons',
  })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({
    description: 'Product slug for URL friendly queries',
    uniqueItems: true,
    example: 'teslo_hoodie',
  })
  @Column('text', { unique: true })
  slug: string;

  @ApiProperty({
    description: 'Available stock',
    default: 0,
    example: 10,
  })
  @Column('int', { default: 0 })
  stock: number;

  @ApiProperty({
    description: 'Product sizes',
    example: ['S', 'M', 'L', 'XL'],
    type: [String],
  })
  @Column('text', { array: true })
  sizes: string[];

  @ApiProperty({
    description: 'Target gender/audience',
    example: 'unisex',
  })
  @Column('text')
  gender: string;

  @ApiProperty({
    description: 'Product tags',
    example: ['hoodie', 'clothes'],
    type: [String],
    default: [],
  })
  @Column('text', { array: true, default: [] })
  tags: string[];

  @ApiProperty({
    description: 'Product images',
    type: [ProductImage],
    required: false,
  })
  @OneToMany(
    () => ProductImage,
    (productImage: ProductImage) => productImage.product,
    { cascade: true, eager: true },
  )
  images?: ProductImage[];

  @ApiProperty({
    description: 'Relation with user',
    type: [User],
    required: false,
  })
  @ManyToOne(() => User, (user) => user.products, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;

  @BeforeInsert()
  runBeforeInsert() {
    this.checkSlug();
    this.generateId();
  }

  @BeforeUpdate()
  runBeforeUpdate() {
    this.checkSlug();
  }

  checkSlug() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  generateId() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}
