/**
 * Biến môi trường server-side. Đọc một chỗ để dễ kiểm soát.
 * KHÔNG import file này vào client component (chỉ dùng ở server / route handler / action).
 */
import 'server-only';

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${name}`);
  }
  return value;
}

export const env = {
  apiBaseUrl: required('API_BASE_URL', process.env.API_BASE_URL).replace(/\/$/, ''),
  webRevalidateUrl: process.env.WEB_REVALIDATE_URL?.replace(/\/$/, '') || '',
  webRevalidateSecret: process.env.WEB_REVALIDATE_SECRET || '',
  isProd: process.env.NODE_ENV === 'production',
};
