import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ColorTone } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateColorDto {
  @ApiProperty({ description: 'Mã màu, vd "SW 6814"' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code!: string;

  @ApiProperty({ description: 'Tên màu, vd "Breathtaking"' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ enum: ColorTone })
  @IsEnum(ColorTone)
  tone!: ColorTone;

  @ApiPropertyOptional({ description: 'URL ảnh mẫu màu' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Mã hex hiển thị nếu không có ảnh', example: '#3E6E8E' })
  @IsOptional()
  @Matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, { message: 'hex không hợp lệ' })
  hex?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
