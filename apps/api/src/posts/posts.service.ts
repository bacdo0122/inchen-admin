import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginated } from '../common/dto/pagination.dto';
import { uniqueSlug } from '../common/slug.util';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly upload: UploadService,
  ) {}

  private slugExists(exclude?: string) {
    return async (slug: string) => {
      const found = await this.prisma.post.findUnique({ where: { slug } });
      return !!found && found.id !== exclude;
    };
  }

  async findPublic(query: QueryPostDto) {
    const where: Prisma.PostWhereInput = {
      status: ContentStatus.PUBLISHED,
      publishedAt: { not: null },
      ...(query.search
        ? { title: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: query.skip,
        take: query.pageSize,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          thumbnail: true,
          publishedAt: true,
        },
      }),
      this.prisma.post.count({ where }),
    ]);
    return paginated(items, total, query.page, query.pageSize);
  }

  async findAllAdmin(query: QueryPostDto) {
    const where: Prisma.PostWhereInput = query.search
      ? { title: { contains: query.search, mode: 'insensitive' } }
      : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.pageSize,
      }),
      this.prisma.post.count({ where }),
    ]);
    return paginated(items, total, query.page, query.pageSize);
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({ where: { slug } });
    if (!post || post.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }
    return post;
  }

  async findOneAdmin(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return post;
  }

  async create(dto: CreatePostDto) {
    const slug = await uniqueSlug(dto.slug || dto.title, this.slugExists());
    const publishedAt = dto.status === ContentStatus.PUBLISHED ? new Date() : null;
    return this.prisma.post.create({ data: { ...dto, slug, publishedAt } });
  }

  async update(id: string, dto: UpdatePostDto) {
    const current = await this.findOneAdmin(id);
    const data: Prisma.PostUpdateInput = { ...dto };
    if (dto.slug || dto.title) {
      data.slug = await uniqueSlug(dto.slug || dto.title!, this.slugExists(id));
    }
    // Lần đầu chuyển sang PUBLISHED thì gán ngày đăng
    if (
      dto.status === ContentStatus.PUBLISHED &&
      current.status !== ContentStatus.PUBLISHED &&
      !current.publishedAt
    ) {
      data.publishedAt = new Date();
    }
    const updated = await this.prisma.post.update({ where: { id }, data });

    // Dọn ảnh không còn dùng trên R2 để tránh rác.
    const stale: string[] = [];
    // Ảnh đại diện đổi (gồm cả bị gỡ về rỗng).
    if (dto.thumbnail !== undefined && current.thumbnail && current.thumbnail !== dto.thumbnail) {
      stale.push(current.thumbnail);
    }
    // Ảnh chèn trong nội dung: URL có ở bản cũ nhưng không còn ở bản mới.
    if (dto.content !== undefined) {
      const oldUrls = this.upload.extractUrls(current.content);
      const newUrls = new Set(this.upload.extractUrls(dto.content));
      stale.push(...oldUrls.filter((u) => !newUrls.has(u)));
    }
    await this.upload.deleteMany(stale);
    return updated;
  }

  async remove(id: string) {
    const current = await this.findOneAdmin(id);
    await this.prisma.post.delete({ where: { id } });
    // Xóa ảnh đại diện + toàn bộ ảnh chèn trong nội dung.
    await this.upload.deleteMany([current.thumbnail, ...this.upload.extractUrls(current.content)]);
    return { success: true };
  }
}
