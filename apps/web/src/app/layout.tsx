import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import { COMPANY } from '@inchem/shared';
import { SITE_URL } from '@/lib/env';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { FloatingContact } from '@/components/layout/floating-contact';
import { LightboxProvider } from '@/components/ui/lightbox';
import './globals.css';

/**
 * Figma dùng "Instrument Sans" (không đảm bảo đủ glyph tiếng Việt).
 * Thay bằng Be Vietnam Pro — cùng dòng sans hình học, phủ đầy tiếng Việt,
 * đồng bộ với app admin.
 */
const fontSans = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const SITE_DESCRIPTION =
  'Minh Hiền - Sơn PU, NC, UV, sơn hệ nước cao cấp cho nội thất gỗ. Tư vấn phối màu, báo giá nhanh.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Sơn gỗ INCHEM (Sherwin-Williams) — Minh Hiền | Nhà phân phối miền Bắc',
    template: '%s | Sơn INCHEM Minh Hiền',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'sơn gỗ INCHEM',
    'sơn PU miền Bắc',
    'sơn Sherwin-Williams',
    'sơn gỗ nội thất',
    'Minh Hiền Inchem',
  ],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: COMPANY.shortName,
    url: SITE_URL,
    title: 'Sơn gỗ INCHEM (Sherwin-Williams) — Minh Hiền',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sơn gỗ INCHEM (Sherwin-Williams) — Minh Hiền',
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: COMPANY.name,
  alternateName: COMPANY.shortName,
  taxID: COMPANY.taxCode,
  email: COMPANY.email,
  telephone: COMPANY.hotline,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo-mh.png`,
  image: `${SITE_URL}/brand/anh_thong_tin_mh.png`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: COMPANY.address,
    addressRegion: 'Hà Nội',
    addressCountry: 'VN',
  },
  // Toạ độ lấy từ link Google Maps thật (COMPANY.map) — giúp đủ điều kiện
  // hiển thị trên Google Maps/Local Pack khi tìm kiếm gần vị trí công ty.
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 21.0689776,
    longitude: 105.955061,
  },
  hasMap: COMPANY.map,
  sameAs: [COMPANY.facebook, COMPANY.youtube, COMPANY.tiktok].filter(Boolean),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={fontSans.variable}>
      <head>
        <meta name="google-site-verification" content="fnA0ybGgXxwMPp7Q2_90oq9Zq6Ui-UftFEFtk4JaJtY" />
      </head>
      <body className="flex min-h-screen flex-col bg-surface font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {/* Provider cho lightbox zoom ảnh (sản phẩm, bảng màu) */}
        <LightboxProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <FloatingContact />
        </LightboxProvider>
      </body>
    </html>
  );
}
