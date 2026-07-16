import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateLeadDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @ApiProperty({ example: '0903232716' })
  @IsString()
  @Matches(/^[0-9+().\s-]{8,20}$/, { message: 'Số điện thoại không hợp lệ' })
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ description: 'Nội dung cần tư vấn' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  // Honeypot chống bot: field ẩn, bot điền → bỏ qua. Người thật để trống.
  @ApiPropertyOptional({ description: 'Để trống (chống spam)' })
  @IsOptional()
  @IsString()
  website?: string;
}
