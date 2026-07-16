import { cn } from '@/lib/utils';

/** Thanh nút cố định dưới form (Huỷ / Lưu nháp / Xuất bản...). */
export function FormActions({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-2 border-t bg-panel/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6',
        className,
      )}
    >
      {children}
    </div>
  );
}
