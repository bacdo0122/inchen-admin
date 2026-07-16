import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { COMPANY } from '@inchem/shared';
import { FOOTER_NAV } from '@/lib/constants';
import { Container } from '@/components/ui/container';
import { zaloHref } from '@/lib/contact';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-section">
      <Container className="grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr_1fr]">
        {/* Cột thương hiệu */}
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/brand/logo-mh.png"
              alt="Logo Minh Hiền - Inchem"
              width={72}
              height={48}
              className="h-20 w-auto object-contain"
            />
            <span className="leading-tight">
              <span className="block text-[17px] font-bold text-indigo">MINH HIỀN - INCHEM</span>
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-fg">
                Nhà phân phối độc quyền thị trường miền Bắc
              </span>
            </span>
          </div>

          <p className="mt-5 text-sm text-fg">
            Giá tốt • Hàng chính hãng • Hỗ trợ phối màu và tư vấn kỹ thuật • Giao hàng nhanh
          </p>

          <ul className="mt-5 space-y-2 text-sm text-muted-fg">
            <li>
              Mã số thuế: <span className="text-fg">{COMPANY.taxCode}</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-indigo" aria-hidden />
              <span className="text-fg">{COMPANY.hotline.join(' – ')}</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-indigo" aria-hidden />
              <a href={`mailto:${COMPANY.email}`} className="text-fg hover:text-indigo">
                {COMPANY.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-indigo" aria-hidden />
              <span className="text-fg">{COMPANY.address}</span>
            </li>
          </ul>
        </div>

        {/* Cột điều hướng */}
        <nav aria-label="Liên kết chân trang">
          <h3 className="text-sm font-bold uppercase tracking-wide text-navy">Liên kết</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {FOOTER_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted-fg transition-colors hover:text-indigo">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Cột đối tác + mạng xã hội */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-navy">Đối tác</h3>
          <div className="mt-4 flex items-center gap-5">
            <Image src="/brand/logo-inchem.png" alt="INCHEM" width={44} height={44} className="h-11 w-auto object-contain" />
            <Image src="/brand/logo-sherwin.png" alt="Sherwin-Williams" width={40} height={57} className="h-14 w-auto object-contain" />
          </div>

          <h3 className="mt-8 text-sm font-bold uppercase tracking-wide text-navy">Kết nối</h3>
          <div className="mt-4 flex items-center gap-3">
            <SocialLink href={COMPANY.facebook} label="Facebook" className="bg-[#1877f2]">
              <Facebook className="size-5 fill-white text-white" />
            </SocialLink>
            <SocialLink href={zaloHref(COMPANY.zalo)} label="Zalo" className="bg-[#0068ff] text-[11px] font-extrabold">
              Zalo
            </SocialLink>
            <SocialLink href={COMPANY.youtube} label="YouTube" className="bg-[#ff0000]">
              <Youtube className="size-5 text-white" />
            </SocialLink>
            <SocialLink href={COMPANY.tiktok} label="TikTok" className="bg-black text-[11px] font-extrabold">
              TikTok
            </SocialLink>
          </div>
        </div>
      </Container>

      <div className="border-t border-border py-4">
        <Container>
          <p className="text-center text-xs text-muted-fg">
            © {new Date().getFullYear()} {COMPANY.name}. Bảo lưu mọi quyền.
          </p>
        </Container>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`inline-flex size-9 items-center justify-center rounded-full text-white transition hover:scale-105 ${className ?? ''}`}
    >
      {children}
    </a>
  );
}
