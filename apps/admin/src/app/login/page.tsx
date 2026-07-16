import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = { title: 'Đăng nhập' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; expired?: string }>;
}) {
  const { next, expired } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-lg font-bold text-brand-fg">
            MH
          </div>
          <h1 className="mt-3 text-lg font-bold text-fg">Quản trị Sơn INCHEM</h1>
          <p className="text-sm text-muted-fg">Đăng nhập để quản lý nội dung &amp; khách hàng</p>
        </div>

        <div className="rounded-xl border bg-panel p-6 shadow-card">
          <LoginForm next={next} expired={expired === '1'} />
        </div>

        <p className="mt-4 text-center text-xs text-muted-fg">
          Chỉ dành cho nhân viên Minh Hiền
        </p>
      </div>
    </main>
  );
}
