'use server';

import { revalidatePath } from 'next/cache';
import type { ContentStatus } from '@inchem/shared';
import { apiFetch, mutate } from '@/lib/mutate';
import { revalidateWeb } from '@/lib/revalidate';
import type { Post } from '@/lib/types';

export interface PostInput {
  title: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  status: ContentStatus;
  slug?: string;
}

function clean(input: PostInput) {
  return {
    title: input.title.trim(),
    content: input.content,
    excerpt: input.excerpt?.trim() || undefined,
    thumbnail: input.thumbnail?.trim() || undefined,
    status: input.status,
    slug: input.slug?.trim() || undefined,
  };
}

export async function createPostAction(input: PostInput) {
  const res = await mutate(() => apiFetch<Post>('/posts', { method: 'POST', body: clean(input) }));
  if (res.ok) {
    revalidatePath('/posts');
    await revalidateWeb(['posts', `post:${res.data.slug}`]);
  }
  return res;
}

export async function updatePostAction(id: string, input: PostInput) {
  const res = await mutate(() =>
    apiFetch<Post>(`/posts/${id}`, { method: 'PATCH', body: clean(input) }),
  );
  if (res.ok) {
    revalidatePath('/posts');
    revalidatePath(`/posts/${id}`);
    await revalidateWeb(['posts', `post:${res.data.slug}`]);
  }
  return res;
}

export async function deletePostAction(id: string, slug: string) {
  const res = await mutate(() => apiFetch<{ success: boolean }>(`/posts/${id}`, { method: 'DELETE' }));
  if (res.ok) {
    revalidatePath('/posts');
    await revalidateWeb(['posts', `post:${slug}`]);
  }
  return res;
}
