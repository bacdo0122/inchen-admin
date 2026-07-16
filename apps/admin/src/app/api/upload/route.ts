import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { getToken } from '@/lib/auth';

/**
 * Proxy upload ảnh: nhận file từ browser → gắn Bearer token (từ cookie httpOnly)
 * → chuyển tiếp sang backend /upload/image. Nhờ vậy token KHÔNG lộ ra client.
 */
export async function POST(req: NextRequest) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ message: 'Chưa đăng nhập' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'Thiếu tệp ảnh' }, { status: 400 });
  }

  const forward = new FormData();
  forward.append('file', file);

  const res = await fetch(`${env.apiBaseUrl}/upload/image`, {
    method: 'POST',
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
    body: forward,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data && String(data.message)) ||
      'Upload ảnh thất bại';
    return NextResponse.json({ message }, { status: res.status });
  }
  return NextResponse.json(data);
}
