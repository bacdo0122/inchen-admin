import type { Metadata } from 'next';
import Image from 'next/image';
import { getColors } from '@/lib/data';
import { Container } from '@/components/ui/container';
import { PageBanner } from '@/components/layout/page-banner';
import { ColorCard } from '@/components/color/color-card';
import { EmptyNote } from '@/components/ui/empty-note';
import { Pagination } from '@/components/ui/pagination';

export const revalidate = 30;

export const metadata: Metadata = {
  title: 'Bảng màu sơn gỗ INCHEM',
  description:
    'Bộ sưu tập màu sắc sơn gỗ INCHEM đa dạng tông ấm, sáng, tối, lạnh — phù hợp mọi phong cách nội thất gỗ.',
  alternates: { canonical: '/bang-mau' },
};

const PAGE_SIZE = 16;

export default async function ColorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  let data = { items: [], total: 0, page, pageSize: PAGE_SIZE, totalPages: 1 } as Awaited<
    ReturnType<typeof getColors>
  >;
  try {
    data = await getColors(page, PAGE_SIZE);
  } catch {
    // giữ mặc định rỗng
  }

  return (
    <>
      {/* Banner ảnh bộ sưu tập màu — full-width */}
      <section className="relative w-full overflow-hidden bg-navy">
        <div className="relative aspect-[1448/493] w-full">
          <Image
            src="/brand/anh_bo_suu_tap.png"
            alt="Bộ sưu tập màu sắc sơn gỗ INCHEM"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      </section>
      <PageBanner
        crumb={[{ label: 'BẢNG MÀU' }]}
        title="Bộ Sưu Tập Màu Sắc"
        subtitle="Khám phá đa dạng tông màu phù hợp mọi phong cách nội thất gỗ hiện đại."
      />
      <section className="py-14 lg:py-20">
        <Container>
          {data.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {data.items.map((c) => (
                  <ColorCard key={c.id} color={c} />
                ))}
              </div>
              <Pagination page={data.page} totalPages={data.totalPages} basePath="/bang-mau" />
            </>
          ) : (
            <EmptyNote>Đang cập nhật bảng màu. Vui lòng quay lại sau.</EmptyNote>
          )}
        </Container>
      </section>
    </>
  );
}
