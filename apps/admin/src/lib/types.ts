import type { ColorTone, ContentStatus, LeadStatus, ProductGroup } from '@inchem/shared';

/** Khớp với model Prisma bên apps/api (trường trả về qua JSON là string cho ngày). */

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
}

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

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  message: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResult {
  url: string;
  publicId: string;
}
