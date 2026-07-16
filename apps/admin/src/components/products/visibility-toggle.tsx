'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { CONTENT_STATUS, type ContentStatus } from '@inchem/shared';
import { cn } from '@/lib/utils';
import { toggleProductStatusAction } from '@/actions/products';

/** Công tắc bật/tắt hiển thị sản phẩm ngay trên bảng danh sách. */
export function VisibilityToggle({ id, status }: { id: string; status: ContentStatus }) {
  const [pending, startTransition] = useTransition();
  const on = status === CONTENT_STATUS.PUBLISHED;

  const toggle = () => {
    startTransition(async () => {
      const next = on ? CONTENT_STATUS.DRAFT : CONTENT_STATUS.PUBLISHED;
      const res = await toggleProductStatusAction(id, next);
      if (!res.ok) toast.error(res.error);
      else toast.success(next === CONTENT_STATUS.PUBLISHED ? 'Đã hiển thị' : 'Đã ẩn');
    });
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggle}
      disabled={pending}
      aria-label={on ? 'Đang hiển thị — bấm để ẩn' : 'Đang ẩn — bấm để hiển thị'}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50',
        on ? 'bg-green-500' : 'bg-muted-fg/40',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          on ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
