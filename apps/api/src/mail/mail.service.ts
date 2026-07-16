import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Lead } from '@prisma/client';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly to?: string;
  private readonly from?: string;

  constructor(config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASS');
    this.to = config.get<string>('MAIL_TO');
    this.from = config.get<string>('MAIL_FROM') ?? user;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: config.get<number>('SMTP_PORT') ?? 587,
        secure: config.get<string>('SMTP_SECURE') === 'true',
        auth: { user, pass },
      });
    } else {
      this.logger.warn('SMTP chưa cấu hình đầy đủ — sẽ không gửi email thông báo.');
    }
  }

  /**
   * Gửi email thông báo có lead mới.
   * Ném lỗi nếu gửi thất bại — caller (LeadsService) đã lưu DB trước nên lead không mất.
   */
  async sendLeadNotification(lead: Lead): Promise<void> {
    if (!this.transporter || !this.to) {
      this.logger.warn(`Bỏ qua gửi mail cho lead ${lead.id} (SMTP/MAIL_TO chưa cấu hình).`);
      return;
    }
    const esc = (s?: string | null) =>
      (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    await this.transporter.sendMail({
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
    this.logger.log(`Đã gửi email thông báo lead ${lead.id}.`);
  }
}
