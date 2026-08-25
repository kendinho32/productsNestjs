import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product title (must be unique)',
    minLength: 3,
    example: 'Teslo Hoodie',
  })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiPropertyOptional({
    description: 'Product price',
    example: 29.99,
    default: 0,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'A warm and comfortable hoodie for all seasons',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Product slug for URL friendly queries',
    example: 'teslo_hoodie',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Available stock',
    example: 10,
    default: 0,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty({
    description: 'Product sizes',
    example: ['S', 'M', 'L', 'XL'],
    type: [String],
  })
  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  @ApiProperty({
    description: 'Target gender/audience',
    enum: ['men', 'women', 'kid', 'unisex'],
    example: 'unisex',
  })
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @ApiPropertyOptional({
    description: 'Product tags',
    example: ['hoodie', 'clothes'],
    type: [String],
    default: [],
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags: string[];

  @ApiPropertyOptional({
    description: 'Product image URLs',
    example: ['image1.jpg', 'image2.jpg'],
    type: [String],
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];
}
