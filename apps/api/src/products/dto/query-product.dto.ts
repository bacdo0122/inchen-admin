import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductGroup } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryProductDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ProductGroup })
  @IsOptional()
  @IsEnum(ProductGroup)
  group?: ProductGroup;

  @ApiPropertyOptional({ description: 'Tìm theo tên' })
  @IsOptional()
  @IsString()
  search?: string;
}
