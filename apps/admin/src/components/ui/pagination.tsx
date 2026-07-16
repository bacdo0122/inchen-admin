import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Phân trang phía server: sinh link giữ nguyên filter hiện tại, chỉ đổi `page`. */
export function Pagination({
  page,
  totalPages,
  pathname,
  params = {},
}: {
  page: number;
  totalPages: number;
  pathname: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v);
    }
    sp.set('page', String(p));
    return `${pathname}?${sp.toString()}`;
  };

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);
  const linkCls =
    'inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border bg-panel px-3 text-sm hover:bg-muted';

  return (
    <nav className="flex items-center justify-between gap-2" aria-label="Phân trang">
      <Link
        href={hrefFor(prev)}
        className={cn(linkCls, page <= 1 && 'pointer-events-none opacity-50')}
        aria-disabled={page <= 1}
      >
        <ChevronLeft className="h-4 w-4" /> Trước
      </Link>
      <span className="text-sm text-muted-fg">
        Trang <span className="font-semibold text-fg">{page}</span> / {totalPages}
      </span>
      <Link
        href={hrefFor(next)}
        className={cn(linkCls, page >= totalPages && 'pointer-events-none opacity-50')}
        aria-disabled={page >= totalPages}
      >
        Sau <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
