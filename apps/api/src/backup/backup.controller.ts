import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BackupService, type BackupResult } from './backup.service';

@ApiTags('backup')
@Controller('backup')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BackupController {
  constructor(private readonly backup: BackupService) {}

  @Post('run')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Chạy backup DB lên R2 ngay (admin) — dùng để kiểm tra thay vì đợi cron 1h sáng',
  })
  run(): Promise<BackupResult> {
    return this.backup.run();
  }
}
