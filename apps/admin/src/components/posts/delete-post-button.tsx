'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { deletePostAction } from '@/actions/posts';

export function DeletePostButton({
  id,
  slug,
  title,
  redirectTo,
  compact,
}: {
  id: string;
  slug: string;
  title: string;
  redirectTo?: string;
  compact?: boolean;
}) {
  const router = useRouter();

  return (
    <ConfirmButton
      trigger={compact ? <Trash2 className="h-4 w-4" /> : <><Trash2 className="h-4 w-4" /> Xoá</>}
      triggerProps={{ variant: compact ? 'ghost' : 'outline', size: compact ? 'icon' : 'sm' }}
      title="Xoá bài viết này?"
      description={`Xoá vĩnh viễn bài "${title}". Hành động không thể hoàn tác.`}
      confirmLabel="Xoá"
      successMessage="Đã xoá bài viết"
      onConfirm={async () => {
        const res = await deletePostAction(id, slug);
        if (!res.ok) return { error: res.error };
        if (redirectTo) router.push(redirectTo);
      }}
    />
  );
}
