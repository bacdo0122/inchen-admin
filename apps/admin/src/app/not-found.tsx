import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface px-4 text-center">
      <p className="text-5xl font-bold text-brand">404</p>
      <h1 className="text-lg font-semibold text-fg">Không tìm thấy trang</h1>
      <p className="text-sm text-muted-fg">Nội dung bạn tìm không tồn tại hoặc đã bị xoá.</p>
      <Link href="/" className="mt-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-fg hover:bg-brand/90">
        Về trang tổng quan
      </Link>
    </main>
  );
}
