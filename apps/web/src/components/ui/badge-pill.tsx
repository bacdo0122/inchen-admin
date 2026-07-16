import { cn } from '@/lib/utils';

/** Nhãn nhỏ dạng viên thuốc (badge) đứng trên tiêu đề section — theo Figma. */
export function BadgePill({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-indigo/30 bg-white px-4 py-1.5',
        'text-xs font-semibold uppercase tracking-wide text-indigo shadow-sm',
        className,
      )}
    >
      {children}
    </span>
  );
}
