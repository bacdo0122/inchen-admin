import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';

/** Map mimetype → phần mở rộng file để đặt key an toàn. */
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

/**
 * Lưu ảnh lên Cloudflare R2 (dùng API tương thích S3 qua @aws-sdk/client-s3).
 *
 * Cấu hình (.env):
 * - R2_ACCOUNT_ID        : Account ID Cloudflare → dựng endpoint
 * - R2_BUCKET            : tên bucket R2
 * - R2_ACCESS_KEY_ID     : Access Key ID của R2 API Token
 * - R2_SECRET_ACCESS_KEY : Secret Access Key của R2 API Token
 * - R2_PUBLIC_URL        : domain công khai (r2.dev hoặc custom domain) để build URL ảnh
 * - R2_FOLDER            : prefix thư mục trong bucket (mặc định "inchem")
 */
@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private client: S3Client | null = null;
  private readonly bucket?: string;
  private readonly folder: string;
  private readonly publicUrl?: string;

  constructor(config: ConfigService) {
    this.bucket = config.get<string>('R2_BUCKET');
    this.folder = config.get<string>('R2_FOLDER') ?? 'inchem';
    // Domain công khai để đọc ảnh: bật "Public Development URL" (*.r2.dev) hoặc custom domain.
    // R2 không cho đọc công khai qua endpoint API, nên biến này gần như bắt buộc.
    this.publicUrl = config.get<string>('R2_PUBLIC_URL') || undefined;

    const accountId = config.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = config.get<string>('R2_SECRET_ACCESS_KEY');

    if (this.bucket && accountId && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        // R2 yêu cầu region cố định "auto".
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        // Bắt buộc path-style: nếu để virtual-hosted-style, SDK ghép bucket thành subdomain
        // (bucket.<accountid>.r2.cloudflarestorage.com) — host 2 cấp không khớp cert wildcard
        // *.r2.cloudflarestorage.com → TLS handshake failure (SSL alert 40).
        forcePathStyle: true,
        credentials: { accessKeyId, secretAccessKey },
        // R2 chưa hỗ trợ checksum CRC mặc định của aws-sdk v3 mới → chỉ tính khi bắt buộc,
        // tránh lỗi "not implemented" / "header you provided implies functionality not implemented".
        requestChecksumCalculation: 'WHEN_REQUIRED',
        responseChecksumValidation: 'WHEN_REQUIRED',
      });
      if (!this.publicUrl) {
        this.logger.warn(
          'R2_PUBLIC_URL chưa cấu hình — URL ảnh trả về sẽ không truy cập công khai được.',
        );
      }
    } else {
      this.logger.warn('Cloudflare R2 chưa cấu hình — endpoint upload sẽ báo lỗi.');
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
    if (!this.client || !this.bucket) {
      throw new InternalServerErrorException('Cloudflare R2 chưa được cấu hình trên server.');
    }

    const ext = EXT_BY_MIME[file.mimetype] ?? 'bin';
    const key = `${this.folder}/${randomUUID()}.${ext}`;
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
    } catch (err) {
      this.logger.error('Upload ảnh lên Cloudflare R2 thất bại', err as Error);
      throw new InternalServerErrorException('Upload ảnh thất bại');
    }

    return { url: this.buildPublicUrl(key), publicId: key };
  }

  /**
   * Xóa 1 object trên R2 theo URL công khai (hoặc key) đã lưu trong DB.
   * Không ném lỗi ra ngoài — chỉ log cảnh báo — để việc xóa ảnh rác không làm
   * hỏng luồng update/xóa bản ghi. Bỏ qua nếu URL/key rỗng hoặc R2 chưa cấu hình.
   */
  async deleteImage(urlOrKey?: string | null): Promise<void> {
    if (!urlOrKey) return;
    if (!this.client || !this.bucket) return;

    const key = this.extractKey(urlOrKey);
    if (!key) return;

    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (err) {
      // R2 trả về thành công kể cả khi key không tồn tại; lỗi ở đây thường là mạng/quyền.
      this.logger.warn(`Xóa ảnh R2 thất bại (key=${key}): ${(err as Error).message}`);
    }
  }

  /**
   * Xóa nhiều object cùng lúc. Tự loại trùng và bỏ giá trị rỗng.
   * Dùng khi 1 bản ghi tham chiếu nhiều ảnh (vd ảnh đại diện + ảnh chèn trong bài).
   */
  async deleteMany(urlsOrKeys: Array<string | null | undefined>): Promise<void> {
    const unique = Array.from(
      new Set(urlsOrKeys.filter((v): v is string => !!v && v.trim().length > 0)),
    );
    await Promise.all(unique.map((v) => this.deleteImage(v)));
  }

  /**
   * Trích tất cả URL ảnh do ta upload (khớp tiền tố R2_PUBLIC_URL) trong 1 đoạn
   * text bất kỳ — vd HTML nội dung bài viết có ảnh chèn qua editor. Trả về mảng
   * URL (đã loại trùng). Rỗng nếu chưa cấu hình R2_PUBLIC_URL.
   */
  extractUrls(text?: string | null): string[] {
    if (!text || !this.publicUrl) return [];
    const base = this.publicUrl.replace(/\/+$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Bắt "<publicUrl>/<đường-dẫn>" đến khi gặp khoảng trắng hoặc ký tự bao (" ' < >).
    const re = new RegExp(`${base}/[^\\s"'<>\\\\)]+`, 'g');
    return Array.from(new Set(text.match(re) ?? []));
  }

  /**
   * Suy ra object key từ URL công khai đã lưu. Chấp nhận cả key thuần
   * (vd "inchem/abc.jpg") lẫn URL đầy đủ. Trả về undefined nếu không hợp lệ.
   */
  private extractKey(urlOrKey: string): string | undefined {
    const value = urlOrKey.trim();
    if (!value) return undefined;

    // Ưu tiên bóc theo R2_PUBLIC_URL nếu URL khớp tiền tố cấu hình.
    if (this.publicUrl && value.startsWith(this.publicUrl)) {
      const rest = value.slice(this.publicUrl.length).replace(/^\/+/, '');
      return rest || undefined;
    }

    // URL đầy đủ khác domain: lấy pathname (bỏ dấu "/" đầu).
    if (/^https?:\/\//i.test(value)) {
      try {
        const key = new URL(value).pathname.replace(/^\/+/, '');
        return key || undefined;
      } catch {
        return undefined;
      }
    }

    // Đã là key thuần.
    return value.replace(/^\/+/, '');
  }

  /** Dựng URL công khai của object từ R2_PUBLIC_URL (r2.dev hoặc custom domain). */
  private buildPublicUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl.replace(/\/+$/, '')}/${key}`;
    }
    // Không có public URL: trả endpoint API (không đọc công khai được) để lộ cấu hình thiếu.
    return `https://${this.bucket}.r2.cloudflarestorage.com/${key}`;
  }
}
