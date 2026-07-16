import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { PostForm } from '@/components/posts/post-form';

export const metadata = { title: 'Thêm bài viết' };

export default function NewPostPage() {
  return (
    <>
      <Link href="/posts" className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Danh sách tin tức
      </Link>
      <PageHeader title="Thêm bài viết" description="Soạn nội dung, lưu nháp hoặc xuất bản lên website." />
      <PostForm />
    </>
  );
}
