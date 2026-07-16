import { apiFetch } from '@/lib/api';
import { AppShell } from '@/components/layout/app-shell';
import type { AdminUser } from '@/lib/types';

// Toàn bộ khu vực quản trị luôn render động — KHÔNG ISR/cache trong admin.
export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // apiFetch tự chuyển về /login nếu token hết hạn (401).
  const [user, countRes] = await Promise.all([
    apiFetch<AdminUser>('/auth/me'),
    apiFetch<{ count: number }>('/leads/count-new').catch(() => ({ count: 0 })),
  ]);

  return (
    <AppShell user={user} leadCount={countRes.count}>
      {children}
    </AppShell>
  );
}
