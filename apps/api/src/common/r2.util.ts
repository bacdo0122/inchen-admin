import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

/**
 * Tạo S3Client trỏ vào Cloudflare R2 từ cấu hình .env.
 * Trả về null khi thiếu bất kỳ biến bắt buộc — caller tự warn và no-op, để app
 * không crash chỉ vì chưa cấu hình storage.
 *
 * Cấu hình (.env):
 * - R2_ACCOUNT_ID        : Account ID Cloudflare → dựng endpoint
 * - R2_ACCESS_KEY_ID     : Access Key ID của R2 API Token
 * - R2_SECRET_ACCESS_KEY : Secret Access Key của R2 API Token
 *
 * Dùng chung cho UploadService (ảnh) và BackupService (dump DB) — mấy tùy chọn
 * dưới đây đều là bắt buộc với R2 nên không muốn copy-paste hai nơi rồi lệch nhau.
 */
export function createR2Client(config: ConfigService): S3Client | null {
  const accountId = config.get<string>('R2_ACCOUNT_ID');
  const accessKeyId = config.get<string>('R2_ACCESS_KEY_ID');
  const secretAccessKey = config.get<string>('R2_SECRET_ACCESS_KEY');

  if (!accountId || !accessKeyId || !secretAccessKey) return null;

  return new S3Client({
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
}
