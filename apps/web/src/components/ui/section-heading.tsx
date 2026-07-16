import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { BadgePill } from './badge-pill';

/**
 * Tiêu đề section chuẩn của web: badge + tiêu đề (có thể nhấn vàng 1 cụm) + phụ đề.
 * `tone="dark"` cho các section nền navy (chữ sáng).
 */
export function SectionHeading({
  badge,
  title,
  subtitle,
  align = 'center',
  tone = 'light',
  className,
}: {
  badge?: string;
  title: ReactNode;
  subtitle?: string;
  align?: 'center' | 'left';
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {badge && <BadgePill>{badge}</BadgePill>}
      <h2
        className={cn(
          'text-2xl font-extrabold leading-tight sm:text-3xl lg:text-[34px]',
          tone === 'dark' ? 'text-white' : 'text-navy',
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'max-w-2xl text-sm sm:text-base',
            tone === 'dark' ? 'text-navy-fg/70' : 'text-muted-fg',
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/** Cụm chữ nhấn màu vàng thương hiệu bên trong tiêu đề. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="text-brand">{children}</span>;
}
