'use server';

import { revalidatePath } from 'next/cache';
import type { ContentStatus, ProductGroup } from '@inchem/shared';
import { apiFetch, mutate } from '@/lib/mutate';
import { revalidateWeb } from '@/lib/revalidate';
import type { Product } from '@/lib/types';

export interface ProductInput {
  name: string;
  group: ProductGroup;
  gloss?: string;
  description?: string;
  image?: string;
  status: ContentStatus;
  order?: number;
  slug?: string;
}

function clean(input: ProductInput) {
  return {
    name: input.name.trim(),
    group: input.group,
    gloss: input.gloss?.trim() || undefined,
    description: input.description?.trim() || undefined,
    image: input.image?.trim() || undefined,
    status: input.status,
    order: input.order ?? 0,
    slug: input.slug?.trim() || undefined,
  };
}

export async function createProductAction(input: ProductInput) {
  const res = await mutate(() =>
    apiFetch<Product>('/products', { method: 'POST', body: clean(input) }),
  );
  if (res.ok) {
    revalidatePath('/products');
    await revalidateWeb(['products', `product:${res.data.slug}`]);
  }
  return res;
}

export async function updateProductAction(id: string, input: ProductInput) {
  const res = await mutate(() =>
    apiFetch<Product>(`/products/${id}`, { method: 'PATCH', body: clean(input) }),
  );
  if (res.ok) {
    revalidatePath('/products');
    revalidatePath(`/products/${id}`);
    await revalidateWeb(['products', `product:${res.data.slug}`]);
  }
  return res;
}

/** Bật/tắt hiển thị nhanh trên bảng danh sách. */
export async function toggleProductStatusAction(id: string, status: ContentStatus) {
  const res = await mutate(() =>
    apiFetch<Product>(`/products/${id}`, { method: 'PATCH', body: { status } }),
  );
  if (res.ok) {
    revalidatePath('/products');
    await revalidateWeb(['products', `product:${res.data.slug}`]);
  }
  return res;
}

export async function deleteProductAction(id: string, slug: string) {
  const res = await mutate(() =>
    apiFetch<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),
  );
  if (res.ok) {
    revalidatePath('/products');
    await revalidateWeb(['products', `product:${slug}`]);
  }
  return res;
}
