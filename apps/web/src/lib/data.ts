import 'server-only';
import type { Paginated } from '@inchem/shared';
import { apiGet, apiGetOrNull } from './api';
import { CACHE_TAGS } from './constants';
import type { Color, Post, Product } from './types';

/**
 * Lớp truy vấn dữ liệu công khai. Gói các endpoint backend + tag cache ISR.
 * Trang gọi các hàm này thay vì fetch trực tiếp.
 */

/** Lấy toàn bộ sản phẩm đã đăng (để nhóm theo hệ sơn ở trang Sản phẩm). */
export async function getProducts(): Promise<Product[]> {
  const res = await apiGet<Paginated<Product>>('/products?pageSize=100', {
    tags: [CACHE_TAGS.products],
  });
  return res.items;
}

export function getColors(tone?: string): Promise<Color[]> {
  const qs = tone ? `?tone=${encodeURIComponent(tone)}` : '';
  return apiGet<Color[]>(`/colors${qs}`, { tags: [CACHE_TAGS.colors] });
}

export function getPosts(page = 1, pageSize = 9): Promise<Paginated<Post>> {
  return apiGet<Paginated<Post>>(`/posts?page=${page}&pageSize=${pageSize}`, {
    tags: [CACHE_TAGS.posts],
  });
}

export function getPost(slug: string): Promise<Post | null> {
  return apiGetOrNull<Post>(`/posts/${encodeURIComponent(slug)}`, {
    tags: [CACHE_TAGS.posts, CACHE_TAGS.post(slug)],
  });
}
