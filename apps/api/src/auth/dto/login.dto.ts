import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@inchemminhhien.com.vn' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'your-password' })
  @IsString()
  @MinLength(6)
  password!: string;
}
