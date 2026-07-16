import Image from 'next/image';
import type { Color } from '@/lib/types';

/** Card mẫu màu — ảnh/mảng màu + tên + mã. */
export function ColorCard({ color }: { color: Color }) {
  return (
    <figure className="group overflow-hidden rounded-xl bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative aspect-square bg-swatch">
        {color.image ? (
          <Image
            src={color.image}
            alt={`Mẫu màu ${color.name}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover"
          />
        ) : (
          <span
            className="absolute inset-0"
            style={{ backgroundColor: color.hex ?? '#c3ddf7' }}
            aria-hidden
          />
        )}
      </div>
      <figcaption className="px-3 py-2.5">
        <p className="truncate text-sm font-semibold text-navy">{color.name}</p>
        <p className="text-xs text-muted-fg">{color.code}</p>
      </figcaption>
    </figure>
  );
}
