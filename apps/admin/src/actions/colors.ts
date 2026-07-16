'use server';

import { revalidatePath } from 'next/cache';
import type { ColorTone } from '@inchem/shared';
import { apiFetch, mutate } from '@/lib/mutate';
import { revalidateWeb } from '@/lib/revalidate';
import type { Color } from '@/lib/types';

export interface ColorInput {
  code: string;
  name: string;
  tone: ColorTone;
  image?: string;
  hex?: string;
  order?: number;
}

function clean(input: ColorInput) {
  return {
    code: input.code.trim(),
    name: input.name.trim(),
    tone: input.tone,
    image: input.image?.trim() || undefined,
    hex: input.hex?.trim() || undefined,
    order: input.order ?? 0,
  };
}

export async function createColorAction(input: ColorInput) {
  const res = await mutate(() => apiFetch<Color>('/colors', { method: 'POST', body: clean(input) }));
  if (res.ok) {
    revalidatePath('/colors');
    await revalidateWeb(['colors']);
  }
  return res;
}

export async function updateColorAction(id: string, input: ColorInput) {
  const res = await mutate(() =>
    apiFetch<Color>(`/colors/${id}`, { method: 'PATCH', body: clean(input) }),
  );
  if (res.ok) {
    revalidatePath('/colors');
    await revalidateWeb(['colors']);
  }
  return res;
}

export async function deleteColorAction(id: string) {
  const res = await mutate(() => apiFetch<{ success: boolean }>(`/colors/${id}`, { method: 'DELETE' }));
  if (res.ok) {
    revalidatePath('/colors');
    await revalidateWeb(['colors']);
  }
  return res;
}
