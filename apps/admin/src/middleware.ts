import { NextResponse, type NextRequest } from 'next/server';

// Giữ khớp với SESSION_COOKIE trong '@/lib/auth' (không import để tránh kéo
// next/headers + env vào edge runtime của middleware).
const SESSION_COOKIE = 'admin_token';

/**
 * Bảo vệ toàn bộ route admin ở tầng edge: chưa có cookie phiên → đá về /login.
 * Đây chỉ là lớp chặn đầu tiên — API backend vẫn bắt buộc auth qua JwtAuthGuard.
 */
export function middleware(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
  const { pathname, search } = req.nextUrl;
  const isLogin = pathname === '/login';

  if (!hasSession && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = pathname !== '/' ? `?next=${encodeURIComponent(pathname + search)}` : '';
    return NextResponse.redirect(url);
  }

  if (hasSession && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Chạy cho mọi route trừ asset tĩnh, ảnh tối ưu, favicon và route handler nội bộ.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
