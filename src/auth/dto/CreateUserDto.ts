import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email user (unique)',
    minLength: 3,
    example: 'user@gmail.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'password for account',
    minLength: 6,
    example: 'xxxxxxxxx',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Full name user',
    minLength: 4,
    example: 'Pedro Guzman',
  })
  @IsString()
  @MinLength(4)
  full_name: string;
}
