import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Limit of items to return',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsPositive()
  @Type((): NumberConstructor => Number)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of items to skip (offset)',
    default: 0,
    example: 0,
  })
  @IsOptional()
  @Min(0)
  @Type((): NumberConstructor => Number)
  offset?: number;
}
