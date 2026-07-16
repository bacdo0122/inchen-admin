'use server';

import { revalidatePath } from 'next/cache';
import type { LeadStatus } from '@inchem/shared';
import { apiFetch, mutate } from '@/lib/mutate';
import type { Lead } from '@/lib/types';

/** Cập nhật trạng thái xử lý lead (Mới / Đã liên hệ / Đã chốt). */
export async function updateLeadStatusAction(id: string, status: LeadStatus) {
  const res = await mutate(() =>
    apiFetch<Lead>(`/leads/${id}/status`, { method: 'PATCH', body: { status } }),
  );
  if (res.ok) {
    revalidatePath('/leads');
    revalidatePath(`/leads/${id}`);
    revalidatePath('/'); // dashboard đếm lead mới
  }
  return res;
}

/** Xoá lead. */
export async function deleteLeadAction(id: string) {
  const res = await mutate(() => apiFetch<{ success: boolean }>(`/leads/${id}`, { method: 'DELETE' }));
  if (res.ok) {
    revalidatePath('/leads');
    revalidatePath('/');
  }
  return res;
}
