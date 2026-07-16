import type { Metadata } from 'next';
import Image from 'next/image';
import { getColors } from '@/lib/data';
import { Container } from '@/components/ui/container';
import { PageBanner } from '@/components/layout/page-banner';
import { ColorsExplorer } from '@/components/color/colors-explorer';
import { EmptyNote } from '@/components/ui/empty-note';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Bảng màu sơn gỗ INCHEM',
  description:
    'Bộ sưu tập màu sắc sơn gỗ INCHEM đa dạng tông ấm, sáng, tối, lạnh — phù hợp mọi phong cách nội thất gỗ.',
  alternates: { canonical: '/bang-mau' },
};

export default async function ColorsPage() {
  let colors: Awaited<ReturnType<typeof getColors>> = [];
  try {
    colors = await getColors();
  } catch {
    colors = [];
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
          {colors.length > 0 ? (
            <ColorsExplorer colors={colors} />
          ) : (
            <EmptyNote>Đang cập nhật bảng màu. Vui lòng quay lại sau.</EmptyNote>
          )}
        </Container>
      </section>
    </>
  );
}
