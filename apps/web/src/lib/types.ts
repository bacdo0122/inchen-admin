import type { ColorTone, ContentStatus, ProductGroup } from '@inchem/shared';

/** Khớp với model Prisma bên apps/api (ngày trả qua JSON là string). */

export interface Product {
  id: string;
  slug: string;
  name: string;
  group: ProductGroup;
  gloss: string | null;
  description: string | null;
  image: string | null;
  status: ContentStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  thumbnail: string | null;
  status: ContentStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Color {
  id: string;
  code: string;
  tone: ColorTone;
  image: string | null;
  hex: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}
