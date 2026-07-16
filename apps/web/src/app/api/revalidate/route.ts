import { NextResponse, type NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { env } from '@/lib/env';

/**
 * On-demand revalidation: admin gọi sau khi tạo/sửa/xóa nội dung để web public
 * cập nhật ngay thay vì chờ hết `revalidate` interval.
 *
 * Contract (khớp apps/admin/src/lib/revalidate.ts):
 *   POST { secret: string, tags: string[] }
 */
export async function POST(req: NextRequest) {
  if (!env.revalidateSecret) {
    return NextResponse.json({ ok: false, message: 'Revalidate chưa được cấu hình.' }, { status: 503 });
  }

  let body: { secret?: string; tags?: unknown } | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Body không hợp lệ.' }, { status: 400 });
  }

  if (!body || body.secret !== env.revalidateSecret) {
    return NextResponse.json({ ok: false, message: 'Sai secret.' }, { status: 401 });
  }

  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === 'string') : [];
  if (tags.length === 0) {
    return NextResponse.json({ ok: false, message: 'Thiếu tags.' }, { status: 400 });
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({ ok: true, revalidated: tags });
}
