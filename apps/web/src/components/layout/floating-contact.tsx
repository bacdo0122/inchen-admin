'use client';

import { Facebook, Phone } from 'lucide-react';
import { COMPANY } from '@inchem/shared';
import { telHref, zaloHref } from '@/lib/contact';

/** Cụm nút liên hệ nhanh nổi góc phải — Zalo / Hotline / Facebook. */
export function FloatingContact() {
  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col gap-3 sm:right-5">
      <FloatBtn href={zaloHref(COMPANY.zalo)} label="Chat Zalo" className="bg-[#0068ff]">
        <span className="text-[11px] font-extrabold text-white">Zalo</span>
      </FloatBtn>
      <FloatBtn href={COMPANY.facebook} label="Facebook" className="bg-[#1877f2]">
        <Facebook className="size-6 fill-white text-white" />
      </FloatBtn>
      <FloatBtn href={telHref(COMPANY.hotline[0])} label="Gọi hotline" external={false} className="bg-cta animate-pulse">
        <Phone className="size-6 text-white" />
      </FloatBtn>
    </div>
  );
}

function FloatBtn({
  href,
  label,
  className,
  external = true,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`inline-flex size-12 items-center justify-center rounded-full shadow-lg shadow-black/20 transition hover:scale-110 ${className ?? ''}`}
    >
      {children}
    </a>
  );
}
