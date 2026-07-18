'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { COMPANY } from '@inchem/shared';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/container';

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Top bar liên hệ */}
      <div className="bg-amber text-[#212020]">
        <Container className="flex h-8 items-center justify-between gap-4 text-[11px] font-semibold sm:text-xs">
          <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-1.5 hover:underline">
            <Mail className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">{COMPANY.email}</span>
          </a>
          <div className="flex items-center gap-4">
            <a href={`tel:${COMPANY.hotline[0].replace(/[.\s]/g, '')}`} className="flex items-center gap-1.5 hover:underline">
              <Phone className="size-3.5" aria-hidden />
              <span>{COMPANY.hotline.join(' - ')}</span>
            </a>
            <span className="hidden items-center gap-1.5 lg:flex">
              <MapPin className="size-3.5" aria-hidden />
              <span className="max-w-[420px] truncate">{COMPANY.address}</span>
            </span>
          </div>
        </Container>
      </div>

      {/* Thanh nav chính */}
      <div className="bg-[#fafcff]/95 backdrop-blur">
        <Container className="flex h-[72px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3" aria-label="Trang chủ Minh Hiền - Inchem">
            <Image
              src="/brand/logo-mh.png"
              alt="Logo Minh Hiền - Inchem"
              width={90}
              height={60}
              priority
              className="h-18 w-auto object-contain"
            />
            <span className="leading-tight">
              <span className="block text-base font-bold text-indigo sm:text-[17px]">
                MINH HIỀN - INCHEM
              </span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-[15px] font-semibold transition-colors',
                    active ? 'text-navy' : 'text-muted-fg hover:text-navy',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg text-navy lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={open}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </Container>

        {/* Nav mobile */}
        {open && (
          <nav className="border-t border-border bg-white lg:hidden">
            <Container className="flex flex-col py-2">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'rounded-lg px-2 py-3 text-sm font-semibold',
                      active ? 'bg-muted text-navy' : 'text-muted-fg',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </Container>
          </nav>
        )}
      </div>
    </header>
  );
}
