import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Trạng thái rỗng đơn giản (chưa có dữ liệu). */
export function EmptyNote({
  children,
  tone = 'light',
}: {
  children: React.ReactNode;
  tone?: 'light' | 'dark';
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center',
        tone === 'dark' ? 'border-white/20 text-navy-fg/70' : 'border-border text-muted-fg',
      )}
    >
      <Inbox className="size-10 opacity-60" aria-hidden />
      <p className="text-sm">{children}</p>
    </div>
  );
}
