'use client';

import { Trash2 } from 'lucide-react';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { deleteColorAction } from '@/actions/colors';

export function DeleteColorButton({ id, name }: { id: string; name: string }) {
  return (
    <ConfirmButton
      trigger={<Trash2 className="h-4 w-4" />}
      triggerProps={{ variant: 'ghost', size: 'icon' }}
      title="Xoá màu này?"
      description={`Xoá "${name}" khỏi bảng màu.`}
      confirmLabel="Xoá"
      successMessage="Đã xoá màu"
      onConfirm={async () => {
        const res = await deleteColorAction(id);
        if (!res.ok) return { error: res.error };
      }}
    />
  );
}
