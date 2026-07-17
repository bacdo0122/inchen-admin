import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { Lead } from '@prisma/client';

/**
 * Gửi email thông báo lead qua Resend (HTTP API, cổng 443).
 * KHÔNG dùng SMTP vì Railway chặn cổng outbound 25/465/587 → ETIMEDOUT.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null = null;
  private readonly to?: string;
  private readonly from: string;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY');
    this.to = config.get<string>('MAIL_TO');
    // From bắt buộc thuộc domain đã verify trên Resend.
    // Chưa verify domain riêng → dùng địa chỉ test onboarding@resend.dev.
    this.from = config.get<string>('MAIL_FROM') ?? 'onboarding@resend.dev';

    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY chưa cấu hình — sẽ không gửi email thông báo.');
    }
  }

  /**
   * Gửi email thông báo có lead mới.
   * Ném lỗi nếu gửi thất bại — caller (LeadsService) đã lưu DB trước nên lead không mất.
   */
  async sendLeadNotification(lead: Lead): Promise<void> {
    if (!this.resend || !this.to) {
      this.logger.warn(`Bỏ qua gửi mail cho lead ${lead.id} (RESEND_API_KEY/MAIL_TO chưa cấu hình).`);
      return;
    }
    const esc = (s?: string | null) =>
      (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const { error } = await this.resend.emails.send({
      from: this.from,
      to: this.to,
      subject: `📩 Yêu cầu tư vấn mới từ ${lead.fullName}`,
      html: `
        <h2>Yêu cầu tư vấn / báo giá mới</h2>
        <table cellpadding="6" style="border-collapse:collapse">
          <tr><td><b>Họ tên</b></td><td>${esc(lead.fullName)}</td></tr>
          <tr><td><b>Điện thoại</b></td><td>${esc(lead.phone)}</td></tr>
          <tr><td><b>Email</b></td><td>${esc(lead.email)}</td></tr>
          <tr><td><b>Địa chỉ</b></td><td>${esc(lead.address)}</td></tr>
          <tr><td><b>Nội dung</b></td><td>${esc(lead.message)}</td></tr>
          <tr><td><b>Thời gian</b></td><td>${lead.createdAt.toLocaleString('vi-VN')}</td></tr>
        </table>
        <p>Xem & xử lý trong trang quản trị.</p>
      `,
    });

    if (error) {
      // Resend trả lỗi trong body thay vì throw → tự ném để caller log được.
      throw new Error(`Resend từ chối gửi: ${error.name} — ${error.message}`);
    }
    this.logger.log(`Đã gửi email thông báo lead ${lead.id}.`);
  }
}
