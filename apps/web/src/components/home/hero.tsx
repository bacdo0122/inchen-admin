import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { HeroSlider } from './hero-slider';

/** Hero trang chủ — slideshow ảnh nền trượt phải→trái, tiêu đề nhấn vàng, 2 CTA. */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      {/* Slideshow ảnh nền trang chủ */}
      <HeroSlider />
      {/* Lớp phủ tối để chữ dễ đọc, đậm bên trái nhạt dần sang phải */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, hsl(var(--navy)/0.9) 0%, hsl(var(--navy)/0.75) 35%, hsl(var(--navy)/0.15) 60%, transparent 80%)",
        }}
        aria-hidden
      />
      <Container className="relative flex min-h-[520px] items-center py-16 md:min-h-[600px] lg:min-h-[680px] lg:py-24">
        <div className="max-w-xl animate-fade-up">
          <span className="inline-flex items-center rounded-full border border-brand/40 bg-brand/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand">
            Sherwin-Williams • INCHEM
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.15] sm:text-5xl lg:text-7xl lg:leading-[1.15]">
            SƠN GỖ
            <div className="text-brand">INCHEM</div>
            CAO CẤP
          </h1>
          <p className="mt-5 max-w-md text-base text-navy-fg/80 sm:text-lg">
            Giải pháp hoàn thiên nội thất gỗ cao cấp
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/san-pham" variant="cta" size="lg" withChevron>
              Xem sản phẩm
            </ButtonLink>
            <ButtonLink href="/lien-he" variant="outline" size="lg" withChevron>
              Liên hệ tư vấn
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
