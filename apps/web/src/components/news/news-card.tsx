import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Newspaper } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/lib/types';

/** Card tin tức — ảnh + tiêu đề + trích dẫn + ngày đăng. */
export function NewsCard({ post }: { post: Post }) {
  const href = `/tin-tuc/${post.slug}`;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover">
      <Link href={href} className="relative block aspect-[16/9] bg-muted">
        {post.thumbnail ? (
          // <Image
          //   src={post.thumbnail}
          //   alt={post.title}
          //   fill
          //   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          //   className="object-cover transition-transform duration-300 group-hover:scale-105"
          // />
          <img
            src={post.thumbnail}
            alt={post.title}
            loading="lazy"
            className="block h-auto w-full rounded-t-2xl transition-transform duration-300"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-navy/25">
            <Newspaper className="size-14" aria-hidden />
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-5">
        {post.publishedAt && (
          <span className="flex items-center gap-1.5 text-xs text-muted-fg">
            <CalendarDays className="size-3.5" aria-hidden />
            {formatDate(post.publishedAt)}
          </span>
        )}
        <h3 className="line-clamp-2 text-base font-bold text-navy transition-colors group-hover:text-indigo">
          <Link href={href}>{post.title}</Link>
        </h3>
        {post.excerpt && <p className="line-clamp-3 text-sm text-muted-fg">{post.excerpt}</p>}
        <Link
          href={href}
          className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-semibold text-indigo"
        >
          Xem thêm
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
