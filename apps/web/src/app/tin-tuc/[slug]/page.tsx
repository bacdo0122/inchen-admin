import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { COMPANY } from '@inchem/shared';
import { getPost } from '@/lib/data';
import { SITE_URL } from '@/lib/env';
import { Container } from '@/components/ui/container';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { formatDate, stripHtml, truncate } from '@/lib/utils';

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  if (!post) return { title: 'Không tìm thấy bài viết' };

  const description = post.excerpt || truncate(stripHtml(post.content || ''), 160);
  return {
    title: post.title,
    description,
    alternates: { canonical: `/tin-tuc/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: `${SITE_URL}/tin-tuc/${post.slug}`,
      ...(post.thumbnail ? { images: [{ url: post.thumbnail }] } : {}),
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
    },
  };
}

export default async function NewsDetailPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    ...(post.thumbnail ? { image: [post.thumbnail] } : {}),
    author: { '@type': 'Organization', name: COMPANY.shortName },
    publisher: { '@type': 'Organization', name: COMPANY.name },
    mainEntityOfPage: `${SITE_URL}/tin-tuc/${post.slug}`,
  };

  return (
    <article className="py-10 lg:py-14">
      <Container className="max-w-3xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Breadcrumb
          items={[{ label: 'TIN TỨC', href: '/tin-tuc' }, { label: post.title }]}
        />

        <h1 className="mt-5 text-2xl font-extrabold leading-tight text-navy sm:text-4xl">
          {post.title}
        </h1>
        {post.publishedAt && (
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-fg">
            <CalendarDays className="size-4" aria-hidden />
            {formatDate(post.publishedAt)}
          </p>
        )}

        {post.thumbnail && (
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div
          className="prose-content mt-8 text-[15px] text-fg"
          dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
        />

        <div className="mt-10 border-t border-border pt-6">
          <Link href="/tin-tuc" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo">
            <ArrowLeft className="size-4" aria-hidden />
            Quay lại tin tức
          </Link>
        </div>
      </Container>
    </article>
  );
}
