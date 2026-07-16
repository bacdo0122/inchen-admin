import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPosts } from '@/lib/data';
import { Container } from '@/components/ui/container';
import { PageBanner } from '@/components/layout/page-banner';
import { NewsCard } from '@/components/news/news-card';
import { EmptyNote } from '@/components/ui/empty-note';
import { cn } from '@/lib/utils';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Tin tức & sự kiện',
  description:
    'Tin tức, kiến thức và sự kiện mới nhất về sơn gỗ INCHEM, Sherwin-Williams và Minh Hiền.',
  alternates: { canonical: '/tin-tuc' },
};

const PAGE_SIZE = 9;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  let data = { items: [], total: 0, page, pageSize: PAGE_SIZE, totalPages: 1 } as Awaited<
    ReturnType<typeof getPosts>
  >;
  try {
    data = await getPosts(page, PAGE_SIZE);
  } catch {
    // giữ mặc định rỗng
  }

  return (
    <>
      {/* Banner ảnh tin tức — full-width */}
      <section className="relative w-full overflow-hidden bg-navy">
        <div className="relative aspect-[1448/493] w-full">
          <Image
            src="/brand/anh_tin_tuc.png"
            alt="Tin tức & sự kiện sơn gỗ INCHEM"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      </section>
      <PageBanner
        crumb={[{ label: 'TIN TỨC' }]}
        title="Tin Tức & Sự Kiện"
        subtitle="Cập nhật kiến thức, sản phẩm và hoạt động mới nhất từ Minh Hiền - Inchem."
      />
      <section className="py-14 lg:py-20">
        <Container>
          {data.items.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.items.map((post) => (
                  <NewsCard key={post.id} post={post} />
                ))}
              </div>
              <Pagination page={data.page} totalPages={data.totalPages} />
            </>
          ) : (
            <EmptyNote>Chưa có bài viết nào. Vui lòng quay lại sau.</EmptyNote>
          )}
        </Container>
      </section>
    </>
  );
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const href = (p: number) => (p <= 1 ? '/tin-tuc' : `/tin-tuc?page=${p}`);

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Phân trang">
      <PageLink href={href(page - 1)} disabled={page <= 1} aria-label="Trang trước">
        <ChevronLeft className="size-4" />
      </PageLink>
      {pages.map((p) => (
        <PageLink key={p} href={href(p)} active={p === page}>
          {p}
        </PageLink>
      ))}
      <PageLink href={href(page + 1)} disabled={page >= totalPages} aria-label="Trang sau">
        <ChevronRight className="size-4" />
      </PageLink>
    </nav>
  );
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
} & React.ComponentProps<typeof Link>) {
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
