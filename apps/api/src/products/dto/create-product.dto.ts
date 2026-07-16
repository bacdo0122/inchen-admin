import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus, ProductGroup } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @ApiProperty({ enum: ProductGroup })
  @IsEnum(ProductGroup)
  group!: ProductGroup;

  @ApiPropertyOptional({ description: 'Độ bóng, vd "10%", "30/90%"' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gloss?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'URL ảnh' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ enum: ContentStatus, default: ContentStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ description: 'Slug tuỳ chỉnh (bỏ trống sẽ tự sinh)' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
