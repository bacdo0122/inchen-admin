import type { Metadata } from 'next';
import Image from 'next/image';
import { getPosts } from '@/lib/data';
import { Container } from '@/components/ui/container';
import { PageBanner } from '@/components/layout/page-banner';
import { NewsCard } from '@/components/news/news-card';
import { EmptyNote } from '@/components/ui/empty-note';
import { Pagination } from '@/components/ui/pagination';

export const revalidate = 30;

type SearchParams = Promise<{ page?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  return {
    title: 'Tin tức & sự kiện',
    description:
      'Tin tức, kiến thức và sự kiện mới nhất về sơn gỗ INCHEM, Sherwin-Williams và Minh Hiền.',
    alternates: { canonical: page <= 1 ? '/tin-tuc' : `/tin-tuc?page=${page}` },
  };
}

const PAGE_SIZE = 9;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
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
              <Pagination page={data.page} totalPages={data.totalPages} basePath="/tin-tuc" />
            </>
          ) : (
            <EmptyNote>Chưa có bài viết nào. Vui lòng quay lại sau.</EmptyNote>
          )}
        </Container>
      </section>
    </>
  );
}
