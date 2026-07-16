'use client';

import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { LEAD_STATUS, type LeadStatus } from '@inchem/shared';
import { Select } from '@/components/ui/input';
import { LEAD_STATUS_META } from '@/lib/constants';
import { updateLeadStatusAction } from '@/actions/leads';

/** Đổi nhanh trạng thái xử lý lead (dùng ở cả danh sách và chi tiết). */
export function LeadStatusControl({
  id,
  status,
  className,
}: {
  id: string;
  status: LeadStatus;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  const onChange = (next: LeadStatus) => {
    if (next === status) return;
    startTransition(async () => {
      const res = await updateLeadStatusAction(id, next);
      if (!res.ok) toast.error(res.error);
      else toast.success(`Đã chuyển sang "${LEAD_STATUS_META[next].label}"`);
    });
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      {pending && <Loader2 className="h-4 w-4 animate-spin text-muted-fg" />}
      <Select
        value={status}
        disabled={pending}
        onChange={(e) => onChange(e.target.value as LeadStatus)}
        className={className}
        aria-label="Trạng thái xử lý"
      >
        {Object.values(LEAD_STATUS).map((s) => (
          <option key={s} value={s}>
            {LEAD_STATUS_META[s].label}
          </option>
        ))}
      </Select>
    </div>
  );
}
