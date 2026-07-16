import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { PostForm } from '@/components/posts/post-form';
import { DeletePostButton } from '@/components/posts/delete-post-button';
import type { Post } from '@/lib/types';

export const metadata = { title: 'Sửa bài viết' };

async function getPost(id: string): Promise<Post> {
  try {
    return await apiFetch<Post>(`/posts/admin/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);

  return (
    <>
      <Link href="/posts" className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Danh sách tin tức
      </Link>
      <PageHeader
        title="Sửa bài viết"
        description={`/${post.slug}`}
        action={<DeletePostButton id={post.id} slug={post.slug} title={post.title} redirectTo="/posts" />}
      />
      <PostForm post={post} />
    </>
  );
}
