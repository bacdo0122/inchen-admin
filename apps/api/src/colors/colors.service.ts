import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { QueryColorDto } from './dto/query-color.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ColorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly upload: UploadService,
  ) {}

  findAll(query: QueryColorDto) {
    const where: Prisma.ColorWhereInput = query.tone ? { tone: query.tone } : {};
    return this.prisma.color.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(id: string) {
    const color = await this.prisma.color.findUnique({ where: { id } });
    if (!color) throw new NotFoundException('Không tìm thấy màu');
    return color;
  }

  create(dto: CreateColorDto) {
    return this.prisma.color.create({ data: dto });
  }

  async update(id: string, dto: UpdateColorDto) {
    const existing = await this.findOne(id);
    const updated = await this.prisma.color.update({ where: { id }, data: dto });
    // Ảnh đã đổi (gồm cả bị gỡ về rỗng) → xóa ảnh cũ trên R2 để tránh rác.
    if (dto.image !== undefined && existing.image && existing.image !== dto.image) {
      await this.upload.deleteImage(existing.image);
    }
    return updated;
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    await this.prisma.color.delete({ where: { id } });
    if (existing.image) {
      await this.upload.deleteImage(existing.image);
    }
    return { success: true };
  }
}
