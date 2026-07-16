'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { deleteProductAction } from '@/actions/products';

export function DeleteProductButton({
  id,
  slug,
  name,
  redirectTo,
  compact,
}: {
  id: string;
  slug: string;
  name: string;
  redirectTo?: string;
  compact?: boolean;
}) {
  const router = useRouter();

  return (
    <ConfirmButton
      trigger={compact ? <Trash2 className="h-4 w-4" /> : <><Trash2 className="h-4 w-4" /> Xoá</>}
      triggerProps={{ variant: compact ? 'ghost' : 'outline', size: compact ? 'icon' : 'sm' }}
      title="Xoá sản phẩm này?"
      description={`Xoá vĩnh viễn "${name}". Hành động không thể hoàn tác.`}
      confirmLabel="Xoá"
      successMessage="Đã xoá sản phẩm"
      onConfirm={async () => {
        const res = await deleteProductAction(id, slug);
        if (!res.ok) return { error: res.error };
        if (redirectTo) router.push(redirectTo);
      }}
    />
  );
}
