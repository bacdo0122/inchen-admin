import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/env';
import { getPosts } from '@/lib/data';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/gioi-thieu', '/san-pham', '/bang-mau', '/tin-tuc', '/lien-he'].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    }),
  );

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPosts(1, 100);
    postRoutes = posts.items.map((p) => ({
      url: `${SITE_URL}/tin-tuc/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    postRoutes = [];
  }

  return [...staticRoutes, ...postRoutes];
}
