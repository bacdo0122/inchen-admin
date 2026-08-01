import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Phân trang phía server: sinh link giữ nguyên filter hiện tại, chỉ đổi `page`.
 * Khi nhiều trang thì rút gọn bằng dấu "…" quanh trang đang xem.
 */
export function Pagination({
  page,
  totalPages,
  basePath,
  params = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v);
    }
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Phân trang">
      <PageLink href={href(page - 1)} disabled={page <= 1} aria-label="Trang trước">
        <ChevronLeft className="size-4" />
      </PageLink>
      {pageItems(page, totalPages).map((item, i) =>
        item === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-navy/50" aria-hidden>
            …
          </span>
        ) : (
          <PageLink
            key={item}
            href={href(item)}
            active={item === page}
            aria-label={`Trang ${item}`}
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </PageLink>
        ),
      )}
      <PageLink href={href(page + 1)} disabled={page >= totalPages} aria-label="Trang sau">
        <ChevronRight className="size-4" />
      </PageLink>
    </nav>
  );
}

/** Luôn hiện trang đầu/cuối + 1 trang kề trang hiện tại, phần bị bỏ thay bằng "gap". */
function pageItems(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const items: (number | 'gap')[] = [];
  const keep = new Set([1, totalPages, page - 1, page, page + 1]);
  // Giữ đủ 5 số ở hai đầu để thanh phân trang không bị nhảy độ rộng.
  if (page <= 3) [2, 3, 4].forEach((p) => keep.add(p));
  if (page >= totalPages - 2) [totalPages - 3, totalPages - 2, totalPages - 1].forEach((p) => keep.add(p));

  for (let p = 1; p <= totalPages; p += 1) {
    if (keep.has(p)) items.push(p);
    else if (items[items.length - 1] !== 'gap') items.push('gap');
  }
  return items;
}

function PageLink({
  href,
  active,
  disabled,
  children,
  ...rest
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, 'href'>) {
  const cls = cn(
    'inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-semibold transition',
    active ? 'bg-indigo text-white' : 'bg-white text-navy shadow-sm hover:bg-muted',
    disabled && 'pointer-events-none opacity-40',
  );
  if (disabled) return <span className={cls}>{children}</span>;
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
