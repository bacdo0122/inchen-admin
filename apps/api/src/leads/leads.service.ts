import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LeadStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { paginated } from '../common/dto/pagination.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  /** Public submit. Lưu DB TRƯỚC, gửi mail sau — mail lỗi không làm mất lead. */
  async create(dto: CreateLeadDto) {
    // Honeypot: bot điền field ẩn "website" → giả vờ thành công, không lưu.
    if (dto.website) {
      this.logger.warn('Honeypot dính — bỏ qua submit nghi ngờ spam.');
      return { success: true };
    }

    const lead = await this.prisma.lead.create({
      data: {
        fullName: dto.fullName.trim(),
        phone: dto.phone.trim(),
        email: dto.email?.trim() || null,
        address: dto.address?.trim() || null,
        message: dto.message?.trim() || null,
      },
    });

    try {
      await this.mail.sendLeadNotification(lead);
    } catch (err) {
      // Không ném lỗi cho client — lead đã an toàn trong DB.
      this.logger.error(`Gửi email thông báo lead ${lead.id} thất bại`, err as Error);
    }

    return { success: true, id: lead.id };
  }

  async findAll(query: QueryLeadDto) {
    const where: Prisma.LeadWhereInput = query.status ? { status: query.status } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.pageSize,
      }),
      this.prisma.lead.count({ where }),
    ]);
    return paginated(items, total, query.page, query.pageSize);
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Không tìm thấy lead');
    return lead;
  }

  async updateStatus(id: string, status: LeadStatus) {
    await this.findOne(id);
    return this.prisma.lead.update({ where: { id }, data: { status } });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.lead.delete({ where: { id } });
    return { success: true };
  }

  /** Đếm lead mới cho badge dashboard. */
  countNew() {
    return this.prisma.lead
      .count({ where: { status: LeadStatus.NEW } })
      .then((count) => ({ count }));
  }
}
