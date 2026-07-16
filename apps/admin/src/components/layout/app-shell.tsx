'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { logoutAction } from '@/actions/auth';
import type { AdminUser } from '@/lib/types';

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function LeadBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white',
        className,
      )}
      aria-label={`${count} yêu cầu mới`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

function NavItems({ leadCount, onNavigate }: { leadCount: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active ? 'bg-brand text-brand-fg' : 'text-fg hover:bg-muted',
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge === 'leads' && (
              <LeadBadge count={leadCount} className={active ? 'bg-white/25' : undefined} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-fg">
        MH
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold text-fg">Sơn INCHEM</p>
        <p className="text-xs text-muted-fg">Trang quản trị</p>
      </div>
    </div>
  );
}

export function AppShell({
  user,
  leadCount,
  children,
}: {
  user: AdminUser;
  leadCount: number;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar desktop */}
      <aside className="hidden border-r bg-panel lg:flex lg:flex-col">
        <Brand />
        <div className="mt-2 flex-1">
          <NavItems leadCount={leadCount} />
        </div>
        <form action={logoutAction} className="border-t p-3">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-fg hover:bg-muted">
            <LogOut className="h-[18px] w-[18px]" />
            Đăng xuất
          </button>
        </form>
      </aside>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-panel shadow-xl">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                onClick={() => setMobileOpen(false)}
                className="mr-3 rounded-md p-1.5 text-muted-fg hover:bg-muted"
                aria-label="Đóng menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 flex-1">
              <NavItems leadCount={leadCount} onNavigate={() => setMobileOpen(false)} />
            </div>
            <form action={logoutAction} className="border-t p-3">
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-fg hover:bg-muted">
                <LogOut className="h-[18px] w-[18px]" />
                Đăng xuất
              </button>
            </form>
          </aside>
        </div>
      )}

      {/* Cột nội dung */}
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-panel/95 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-fg hover:bg-muted lg:hidden"
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center gap-2">
            {leadCount > 0 && (
              <Link
                href="/leads?status=NEW"
                className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
              >
                <LeadBadge count={leadCount} />
                yêu cầu mới cần xử lý
              </Link>
            )}
          </div>

          <div className="text-right leading-tight">
            <p className="text-sm font-medium text-fg">{user.name || 'Quản trị viên'}</p>
            <p className="text-xs text-muted-fg">{user.email}</p>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
