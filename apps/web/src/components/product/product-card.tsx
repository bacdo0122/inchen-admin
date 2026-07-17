import Link from 'next/link';
import { PaintBucket } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import type { Product } from '@/lib/types';

/**
 * Card sản phẩm — ảnh nền xanh nhạt + tên + độ bóng (gloss) + nút "Liên hệ".
 * Theo yêu cầu: click sản phẩm dẫn tới trang liên hệ để nhận tư vấn/báo giá.
 */
export function ProductCard({ product }: { product: Product }) {
  const glossValues = (product.gloss ?? '')
    .split(/[•,/|]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <article className="group flex transform-gpu flex-col overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover">
      <Link href="/lien-he" className="block bg-black" aria-label={`Liên hệ về ${product.name}`}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="block h-auto w-full rounded-t-2xl transition-transform duration-300"
          />
        ) : (
          <span className="flex aspect-[4/3] items-center justify-center text-navy/30">
            <PaintBucket className="size-16" aria-hidden />
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-[15px] font-bold text-navy">{product.name}</h3>

        {glossValues.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-fg">Độ bóng</span>
            {glossValues.map((g) => (
              <span
                key={g}
                className="rounded bg-cta/15 px-1.5 py-0.5 text-[11px] font-semibold text-cta"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        <ButtonLink
          href="/lien-he"
          variant="ghost"
          size="sm"
          className="mt-auto self-start bg-indigo text-white transition-colors hover:bg-indigo/90 hover:shadow-md"
        >
          Liên hệ
        </ButtonLink>
      </div>
    </article>
  );
}
