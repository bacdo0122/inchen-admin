import 'server-only';
import { env } from './env';

/** Lỗi từ API — giữ status + thông điệp để hiển thị/log. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function extractMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const m = (body as { message: unknown }).message;
    if (Array.isArray(m)) return m.join(', ');
    if (typeof m === 'string') return m;
  }
  return fallback;
}

type GetOptions = {
  /** Số giây ISR. Mặc định 60s. Đặt 0 để không cache. */
  revalidate?: number;
};

/**
 * GET dữ liệu công khai từ backend (SSG + ISR).
 * Cache theo thời gian: nội dung tự làm mới sau `revalidate` giây (mặc định 60s).
 */
export async function apiGet<T>(path: string, options: GetOptions = {}): Promise<T> {
  const { revalidate = 60 } = options;
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate },
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    throw new ApiError(res.status, extractMessage(data, `Lỗi máy chủ (${res.status})`));
  }
  return data as T;
}

/**
 * GET nhưng trả về `null` khi 404 (dùng cho trang chi tiết → notFound()).
 */
export async function apiGetOrNull<T>(path: string, options: GetOptions = {}): Promise<T | null> {
  try {
    return await apiGet<T>(path, options);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/**
 * POST không cache (dùng cho submit form lead qua server action).
 */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    throw new ApiError(res.status, extractMessage(data, `Lỗi máy chủ (${res.status})`));
  }
  return data as T;
}
