import 'server-only';
import { ApiError, apiFetch } from './api';

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Bọc một mutation gọi API: bắt lỗi ApiError thành {error} để form hiển thị.
 * KHÔNG nuốt lỗi redirect của Next (vd 401 → /login) — chỉ ApiError mới thành {error}.
 */
export async function mutate<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, error: err.message };
    throw err;
  }
}

export { apiFetch };
