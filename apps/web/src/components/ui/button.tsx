import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'cta' | 'outline' | 'teal' | 'brand' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  // Nút hành động cam gradient (hero "Xem sản phẩm")
  cta: 'bg-cta text-cta-fg hover:brightness-105 shadow-[0_8px_20px_-8px_hsl(var(--cta)/0.7)]',
  // Viền trắng trên nền tối (hero "Liên hệ tư vấn")
  outline: 'border border-white/70 text-white hover:bg-white/10',
  // Nút gửi form
  teal: 'bg-teal text-teal-fg hover:brightness-105',
  // Nút vàng thương hiệu
  brand: 'bg-brand text-brand-fg hover:brightness-95',
  // Nút phụ nhạt
  ghost: 'bg-muted text-navy hover:bg-border',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[15px]',
  lg: 'h-12 px-7 text-base',
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  withChevron?: boolean;
  className?: string;
  children: ReactNode;
};

function classesFor(variant: Variant, size: Size, className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    sizes[size],
    className,
  );
}

/** Nút dạng link (điều hướng nội bộ). */
export function ButtonLink({
  href,
  variant = 'cta',
  size = 'md',
  withChevron = false,
  className,
  children,
  ...rest
}: BaseProps & { href: string } & Omit<ComponentProps<typeof Link>, 'href' | 'className'>) {
  return (
    <Link href={href} className={classesFor(variant, size, className)} {...rest}>
      {children}
      {withChevron && <ChevronRight className="size-4" aria-hidden />}
    </Link>
  );
}

/** Nút dạng button (submit form...). */
export function Button({
  variant = 'cta',
  size = 'md',
  withChevron = false,
  className,
  children,
  ...rest
}: BaseProps & ComponentProps<'button'>) {
  return (
    <button className={classesFor(variant, size, className)} {...rest}>
      {children}
      {withChevron && <ChevronRight className="size-4" aria-hidden />}
    </button>
  );
}
