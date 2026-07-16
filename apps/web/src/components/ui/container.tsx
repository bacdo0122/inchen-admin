import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Khung nội dung giới hạn bề ngang, canh giữa (tương đương ~1200px của Figma). */
export function Container({
  as: Tag = 'div',
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cn('mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8', className)}>{children}</Tag>;
}
