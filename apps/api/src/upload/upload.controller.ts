import {
  BadRequestException,
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly upload: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: 'Upload 1 ảnh (admin), trả về URL' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(jpe?g|png|webp|gif|avif)$/.test(file.mimetype)) {
          return cb(new BadRequestException('Chỉ chấp nhận ảnh (jpg, png, webp, gif, avif)'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: MAX_SIZE })
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
  ) {
    return this.upload.uploadImage(file);
  }
}
