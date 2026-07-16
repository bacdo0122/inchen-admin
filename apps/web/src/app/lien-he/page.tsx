import type { Metadata } from 'next';
import { Wrench } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { PageBanner } from '@/components/layout/page-banner';
import { LeadForm } from '@/components/contact/lead-form';
import { ContactInfo } from '@/components/contact/contact-info';

export const metadata: Metadata = {
  title: 'Liên hệ',
  description:
    'Liên hệ Minh Hiền - Inchem để được tư vấn hệ sơn gỗ, phối màu và báo giá. Hotline 093.642.8226 – 0777.379.998.',
  alternates: { canonical: '/lien-he' },
};

const SERVICES = [
  'Tư vấn lựa chọn hệ sơn phù hợp',
  'Hướng dẫn quy trình thi công',
  'Hỗ trợ phối màu theo yêu cầu',
  'Báo giá nhanh, giao hàng tận nơi',
];

export default function ContactPage() {
  return (
    <>
      <PageBanner
        crumb={[{ label: 'LIÊN HỆ' }]}
        title="Liên Hệ Với Chúng Tôi"
        subtitle="Để lại thông tin, đội ngũ tư vấn của Minh Hiền sẽ liên hệ hỗ trợ bạn trong thời gian sớm nhất."
      />

      <section className="py-14 lg:py-20">
        <Container className="grid gap-10 lg:grid-cols-2">
          <LeadForm />
          <ContactInfo />
        </Container>

        <Container className="mt-14">
          <h2 className="text-xl font-bold uppercase tracking-wide text-navy">Dịch vụ kỹ thuật</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <li key={s} className="flex items-center gap-3 rounded-xl bg-section px-4 py-3 text-sm text-fg">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo/10 text-indigo">
                  <Wrench className="size-4" aria-hidden />
                </span>
                {s}
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
