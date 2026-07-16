import 'server-only';
import { redirect } from 'next/navigation';
import { env } from './env';
import { getToken } from './auth';

/** Lỗi từ API — giữ status + thông điệp để hiển thị cho người dùng. */
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

type FetchOptions = Omit<RequestInit, 'body'> & { body?: unknown };

/**
 * Gọi backend NestJS kèm Bearer token (đọc từ cookie httpOnly).
 * - Dữ liệu admin luôn cần mới nhất → mặc định `cache: 'no-store'` (KHÔNG ISR trong admin).
 * - 401 → coi như hết phiên: chuyển về trang đăng nhập.
 */
export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const token = await getToken();
  const { body, headers, ...rest } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    ...rest,
    cache: 'no-store',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  if (res.status === 401) {
    redirect('/login?expired=1');
  }

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    throw new ApiError(res.status, extractMessage(data, `Lỗi máy chủ (${res.status})`));
  }

  return data as T;
}
