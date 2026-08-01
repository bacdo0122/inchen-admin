import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/env';
import { getPosts } from '@/lib/data';

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/gioi-thieu', '/san-pham', '/bang-mau', '/tin-tuc', '/lien-he'].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    }),
  );

  const postRoutes: MetadataRoute.Sitemap = [];
  try {
    const pageSize = 100;
    let page = 1;
    let totalPages = 1;
    do {
      const posts = await getPosts(page, pageSize);
      totalPages = posts.totalPages;
      postRoutes.push(
        ...posts.items.map((p) => ({
          url: `${SITE_URL}/tin-tuc/${p.slug}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        })),
      );
      page += 1;
    } while (page <= totalPages);
  } catch {
    postRoutes.length = 0;
  }

  return [...staticRoutes, ...postRoutes];
}
