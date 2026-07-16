import 'server-only';
import { cookies } from 'next/headers';
import { env } from './env';

/** Cookie httpOnly chứa JWT — không bao giờ đọc được từ JS phía client. */
export const SESSION_COOKIE = 'admin_token';

const MAX_AGE = 60 * 60 * 24 * 7; // 7 ngày, khớp JWT_EXPIRES_IN mặc định của API

/** Lấy JWT từ cookie (server). Trả null nếu chưa đăng nhập. */
export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

/** Ghi phiên đăng nhập sau khi login thành công. */
export async function setSession(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

/** Xoá phiên (đăng xuất). */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
