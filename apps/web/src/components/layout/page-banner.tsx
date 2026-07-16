import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/container';
import { Breadcrumb } from './breadcrumb';

/**
 * Banner đầu trang con: breadcrumb + tiêu đề + phụ đề.
 * tone "light" (xanh nhạt) hoặc "navy".
 */
export function PageBanner({
  title,
  subtitle,
  crumb,
  tone = 'light',
  children,
}: {
  title: ReactNode;
  subtitle?: string;
  crumb: { label: string; href?: string }[];
  tone?: 'light' | 'navy';
  children?: ReactNode;
}) {
  const dark = tone === 'navy';
  return (
    <section className={cn(dark ? 'bg-navy text-white' : 'bg-[#c8d7e6]/50')}>
      <Container className="py-10 lg:py-14">
        <Breadcrumb items={crumb} tone={dark ? 'dark' : 'light'} />
        <div className="mt-5 text-center">
          <h1
            className={cn(
              'text-3xl font-extrabold sm:text-4xl',
              dark ? 'text-white' : 'text-navy',
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className={cn('mx-auto mt-3 max-w-2xl text-sm sm:text-base', dark ? 'text-navy-fg/70' : 'text-fg/70')}>
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </Container>
    </section>
  );
}
