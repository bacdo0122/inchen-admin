import { ApiPropertyOptional } from '@nestjs/swagger';
import { ColorTone } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class QueryColorDto {
  @ApiPropertyOptional({ enum: ColorTone, description: 'Lọc theo tông màu' })
  @IsOptional()
  @IsEnum(ColorTone)
  tone?: ColorTone;
}
