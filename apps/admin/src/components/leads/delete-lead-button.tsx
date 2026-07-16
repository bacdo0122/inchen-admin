'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { deleteLeadAction } from '@/actions/leads';

export function DeleteLeadButton({
  id,
  name,
  redirectTo,
  compact,
}: {
  id: string;
  name: string;
  /** Điều hướng sau khi xoá (dùng ở trang chi tiết). */
  redirectTo?: string;
  compact?: boolean;
}) {
  const router = useRouter();

  return (
    <ConfirmButton
      trigger={
        compact ? (
          <Trash2 className="h-4 w-4" />
        ) : (
          <>
            <Trash2 className="h-4 w-4" /> Xoá
          </>
        )
      }
      triggerProps={{ variant: compact ? 'ghost' : 'outline', size: compact ? 'icon' : 'sm' }}
      title="Xoá yêu cầu này?"
      description={`Xoá vĩnh viễn yêu cầu của "${name}". Hành động không thể hoàn tác.`}
      confirmLabel="Xoá"
      successMessage="Đã xoá yêu cầu"
      onConfirm={async () => {
        const res = await deleteLeadAction(id);
        if (!res.ok) return { error: res.error };
        if (redirectTo) router.push(redirectTo);
      }}
    />
  );
}
