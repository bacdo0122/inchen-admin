import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { COMPANY } from '@inchem/shared';
import { getColors, getPosts, getProducts } from '@/lib/data';
import { SITE_URL } from '@/lib/env';
import { Container } from '@/components/ui/container';
import { Accent, SectionHeading } from '@/components/ui/section-heading';
import { ButtonLink } from '@/components/ui/button';
import { Hero } from '@/components/home/hero';
import { ProductCard } from '@/components/product/product-card';
import { ColorCard } from '@/components/color/color-card';
import { NewsCard } from '@/components/news/news-card';
import { LeadForm } from '@/components/contact/lead-form';
import { ContactInfo } from '@/components/contact/contact-info';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { url: SITE_URL },
};

// ISR theo thời gian: trang chủ tự làm mới sau mỗi 30 giây.
export const revalidate = 30;

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [products, colors, posts] = await Promise.all([
    safe(getProducts(), []),
    safe(getColors(), []),
    safe(getPosts(1, 3), { items: [], total: 0, page: 1, pageSize: 3, totalPages: 1 }),
  ]);

  return (
    <>
      <Hero />

      {/* Sản phẩm nổi bật */}
      {products.length > 0 && (
        <section className="bg-navy py-16 lg:py-20">
          <Container>
            <SectionHeading
              badge="Sản phẩm"
              tone="dark"
              title={
                <>
                  Sơn <Accent>Pu InChem</Accent> Cao Cấp
                </>
              }
              subtitle="Hệ sơn trang trí nội thất gỗ — bền màu, an toàn, đạt chuẩn Sherwin-Williams."
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <ButtonLink href="/san-pham" variant="brand" size="md" withChevron>
                Xem thêm sản phẩm
              </ButtonLink>
            </div>
          </Container>
        </section>
      )}

      <section className="py-16 lg:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted shadow-card">
            <Image
              src="/brand/anh_thong_tin_mh.png"
              alt="Trụ sở Công ty TNHH DV TM & SX Minh Hiền"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <SectionHeading
              align="left"
              badge="Công Ty TNHH DV TM & SX Minh Hiền"
              title="Nhà phân phối sơn Sherwin-Williams “Inchem” khu vực phía Bắc"
            />
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-fg sm:text-[15px]">
              <p>
                Công ty TNHH DV TM &amp; SX Minh Hiền có hơn 25 năm kinh nghiệm trong lĩnh vực sơn gỗ
                nội thất. Chúng tôi nghiên cứu và phát triển hàng chục nghìn mẫu sơn trên nhiều chất
                liệu gỗ, thực hiện bởi đội ngũ kỹ thuật viên giàu kinh nghiệm.
              </p>
              <p>
                Với cam kết cung cấp sản phẩm chính hãng, giải pháp hoàn thiện bề mặt tối ưu và dịch
                vụ kỹ thuật chuyên nghiệp, Minh Hiền góp phần nâng cao chất lượng và giá trị cho từng
                sản phẩm nội thất của khách hàng.
              </p>
            </div>
            <div className="mt-6">
              <ButtonLink href="/gioi-thieu" variant="ghost" size="md" withChevron>
                Tìm hiểu thêm
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* Bộ sưu tập màu sắc */}
      {colors.length > 0 && (
        <section className="bg-section py-16 lg:py-20">
          <Container>
            <SectionHeading
              badge="Bảng màu"
              title={
                <>
                  Bộ Sưu Tập <Accent>Màu Sắc</Accent>
                </>
              }
              subtitle="Khám phá đa dạng tông màu phù hợp mọi phong cách nội thất gỗ hiện đại."
            />
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {colors.slice(0, 12).map((c) => (
                <ColorCard key={c.id} color={c} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <ButtonLink href="/bang-mau" variant="cta" size="md" withChevron>
                Xem toàn bộ bảng màu
              </ButtonLink>
            </div>
          </Container>
        </section>
      )}

      {/* Tin tức */}
      {posts.items.length > 0 && (
        <section className="py-16 lg:py-20">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading align="left" badge="Tin tức & sự kiện" title="Tin tức mới nhất" />
              <Link href="/tin-tuc" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo">
                Tất cả tin tức
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.items.map((post) => (
                <NewsCard key={post.id} post={post} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Liên hệ */}
      <section id="lien-he" className="bg-section py-16 lg:py-20">
        <Container>
          <SectionHeading title="Liên Hệ Với Chúng Tôi" subtitle={COMPANY.name} />
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <LeadForm />
            <ContactInfo />
          </div>
        </Container>
      </section>
    </>
  );
}
