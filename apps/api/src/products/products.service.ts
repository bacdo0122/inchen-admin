import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginated } from '../common/dto/pagination.dto';
import { uniqueSlug } from '../common/slug.util';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly upload: UploadService,
  ) {}

  private slugExists(exclude?: string) {
    return async (slug: string) => {
      const found = await this.prisma.product.findUnique({ where: { slug } });
      return !!found && found.id !== exclude;
    };
  }

  /** Danh sách công khai: chỉ sản phẩm đã đăng. */
  async findPublic(query: QueryProductDto) {
    return this.list(query, ContentStatus.PUBLISHED);
  }

  /** Danh sách cho admin: tất cả trạng thái. */
  async findAllAdmin(query: QueryProductDto) {
    return this.list(query);
  }

  private async list(query: QueryProductDto, status?: ContentStatus) {
    const where: Prisma.ProductWhereInput = {
      ...(status ? { status } : {}),
      ...(query.group ? { group: query.group } : {}),
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip: query.skip,
        take: query.pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);
    return paginated(items, total, query.page, query.pageSize);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug } });
    if (!product || product.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    return product;
  }

  async findOneAdmin(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return product;
  }

  async create(dto: CreateProductDto) {
    const slug = await uniqueSlug(dto.slug || dto.name, this.slugExists());
    return this.prisma.product.create({ data: { ...dto, slug } });
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.findOneAdmin(id);
    const data: Prisma.ProductUpdateInput = { ...dto };
    if (dto.slug || dto.name) {
      data.slug = await uniqueSlug(dto.slug || dto.name!, this.slugExists(id));
    }
    const updated = await this.prisma.product.update({ where: { id }, data });

    // Ảnh đã đổi (gồm cả bị gỡ về rỗng) → xóa ảnh cũ trên R2 để tránh rác.
    if (dto.image !== undefined && existing.image && existing.image !== dto.image) {
      await this.upload.deleteImage(existing.image);
    }
    return updated;
  }

  async remove(id: string) {
    const existing = await this.findOneAdmin(id);
    await this.prisma.product.delete({ where: { id } });
    if (existing.image) {
      await this.upload.deleteImage(existing.image);
    }
    return { success: true };
  }
}
