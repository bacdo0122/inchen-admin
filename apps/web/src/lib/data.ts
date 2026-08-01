import 'server-only';
import type { Paginated } from '@inchem/shared';
import { apiGet, apiGetOrNull } from './api';
import type { Color, Post, Product } from './types';

/**
 * Lớp truy vấn dữ liệu công khai. Gói các endpoint backend với cache ISR theo thời gian.
 * Trang gọi các hàm này thay vì fetch trực tiếp.
 */

/** Lấy toàn bộ sản phẩm đã đăng (để nhóm theo hệ sơn ở trang Sản phẩm). */
export async function getProducts(): Promise<Product[]> {
  const res = await apiGet<Paginated<Product>>('/products?pageSize=100');
  return res.items;
}

export function getColors(page = 1, pageSize = 16, tone?: string): Promise<Paginated<Color>> {
  const sp = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (tone) sp.set('tone', tone);
  return apiGet<Paginated<Color>>(`/colors?${sp}`);
}

export function getPosts(page = 1, pageSize = 9): Promise<Paginated<Post>> {
  return apiGet<Paginated<Post>>(`/posts?page=${page}&pageSize=${pageSize}`);
}

export function getPost(slug: string): Promise<Post | null> {
  return apiGetOrNull<Post>(`/posts/${encodeURIComponent(slug)}`);
}
