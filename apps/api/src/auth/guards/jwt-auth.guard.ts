import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Bảo vệ endpoint quản trị (tạo/sửa/xóa). */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
