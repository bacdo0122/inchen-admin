import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

/** 4 loại sơn ở trang chủ — click chuyển sang /san-pham với nhóm được active sẵn. */
const CATEGORIES = [
  { key: 'PU', label: 'Sơn PU', img: '/brand/son_pu.png' },
  { key: 'NC', label: 'Sơn NC', img: '/brand/son_nc.png' },
  { key: 'UV', label: 'Sơn UV', img: '/brand/son_uv.png' },
  { key: 'OTHER', label: 'Sản phẩm khác', img: '/brand/son_khac.png' },
] as const;

export function ProductCategories() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {CATEGORIES.map((c) => (
        <Link
          key={c.key}
          href={`/san-pham?group=${c.key}`}
          className="group relative block overflow-hidden rounded-2xl bg-white/5 shadow-card ring-1 ring-white/10 transition hover:ring-brand/60"
        >
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={c.img}
              alt={c.label}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            {/* Lớp phủ tối dưới đáy để chữ nổi */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h3 className="text-lg font-extrabold text-white">{c.label}</h3>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand">
              Xem sản phẩm
              <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
