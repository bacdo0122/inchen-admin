import Image from 'next/image';
import { ButtonLink } from '@/components/ui/button';
import type { Color } from '@/lib/types';

/** Card mẫu màu — ảnh đứng (portrait) với nhãn mã màu ở góc trên-trái + nút "Liên hệ". */
export function ColorCard({ color }: { color: Color }) {
  return (
    <figure className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative aspect-[3/4] bg-swatch">
        {color.image ? (
          <Image
            src={color.image}
            alt={`Mẫu màu ${color.code}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
      <div className="flex flex-col gap-2 p-3">
        <p className="text-sm font-extrabold tracking-wide text-navy">{color.code}</p>
        <ButtonLink
          href="/lien-he"
          variant="ghost"
          size="sm"
          aria-label={`Liên hệ về màu ${color.code}`}
          className="self-start bg-indigo text-white transition-colors hover:bg-indigo/90 hover:shadow-md"
        >
          Liên hệ
        </ButtonLink>
      </div>
    </figure>
  );
}
