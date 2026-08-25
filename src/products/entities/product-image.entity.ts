import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { v7 as uuid } from 'uuid';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {
  @ApiProperty({
    format: 'uuid',
    description: 'Unique identifier of the image',
    example: '01918a5f-55cc-7d1a-85d8-372093e83ba5',
  })
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'URL of the product image',
    example: 'http://localhost:3000/api/files/product/image.jpg',
  })
  @Column('text', { unique: true, nullable: false })
  url: string;

  @ManyToOne(
    () => Product,
    (product: Product): ProductImage[] | undefined => product.images,
    { onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  product: Product;

  @BeforeInsert()
  runBeforeInsert() {
    this.generateId();
  }

  generateId() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}
