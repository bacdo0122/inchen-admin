import Link from 'next/link';
import { SITE_URL } from '@/lib/env';
import { cn } from '@/lib/utils';

type Crumb = { label: string; href?: string };

/** Breadcrumb "TRANG CHỦ/ ..." theo Figma. tone="dark" cho trang nền navy. */
export function Breadcrumb({ items, tone = 'light' }: { items: Crumb[]; tone?: 'light' | 'dark' }) {
  const all: Crumb[] = [{ label: 'TRANG CHỦ', href: '/' }, ...items];

  // JSON-LD BreadcrumbList giúp Google hiển thị breadcrumb rich result.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${SITE_URL}${c.href}` } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="text-xs font-semibold uppercase tracking-wide">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex flex-wrap items-center gap-1">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className={cn(
                    'transition-colors',
                    tone === 'dark' ? 'text-navy-fg/60 hover:text-white' : 'text-muted-fg hover:text-indigo',
                  )}
                >
                  {c.label}
                </Link>
              ) : (
                <span className={tone === 'dark' ? 'text-brand' : 'text-indigo'}>{c.label}</span>
              )}
              {!last && <span className={tone === 'dark' ? 'text-navy-fg/40' : 'text-border'}>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
