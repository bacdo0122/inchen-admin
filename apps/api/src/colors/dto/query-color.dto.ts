import { ApiPropertyOptional } from '@nestjs/swagger';
import { ColorTone } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryColorDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ColorTone, description: 'Lọc theo tông màu' })
  @IsOptional()
  @IsEnum(ColorTone)
  tone?: ColorTone;
}
