import 'server-only';
import { env } from './env';

/**
 * Kích hoạt on-demand revalidation trên web public (apps/web) sau khi admin
 * đổi nội dung. Đây là BEST-EFFORT: lỗi ở đây KHÔNG làm hỏng thao tác lưu —
 * web vẫn tự làm mới khi hết `revalidate` interval mặc định.
 *
 * Thống nhất tag với frontend-dev: 'posts' | 'post:<slug>' | 'products' |
 * 'product:<slug>' | 'colors'.
 *
 * @returns true nếu gọi thành công; false nếu chưa cấu hình hoặc gọi lỗi.
 */
export async function revalidateWeb(tags: string[]): Promise<boolean> {
  if (!env.webRevalidateUrl || !env.webRevalidateSecret) {
    // Chưa cấu hình (vd môi trường dev chưa dựng web) — bỏ qua yên lặng.
    return false;
  }
  try {
    const res = await fetch(env.webRevalidateUrl, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.webRevalidateSecret, tags }),
    });
    return res.ok;
  } catch (err) {
    console.error('[revalidateWeb] Không gọi được revalidate web public:', err);
    return false;
  }
}
