import Link from 'next/link';
import Image from 'next/image';
import { Newspaper, Pencil, Plus } from 'lucide-react';
import type { Paginated } from '@inchem/shared';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { LinkButton, Button } from '@/components/ui/button';
import { Table, THead, TR, TH, TD } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchInput } from '@/components/shared/table-filters';
import { ContentStatusBadge } from '@/components/shared/status-badges';
import { DeletePostButton } from '@/components/posts/delete-post-button';
import type { Post } from '@/lib/types';

export const metadata = { title: 'Tin tức' };

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const sp = new URLSearchParams({ page: String(page), pageSize: '12' });
  if (search) sp.set('search', search);
  const data = await apiFetch<Paginated<Post>>(`/posts/admin/all?${sp.toString()}`);

  return (
    <>
      <PageHeader
        title="Tin tức"
        description={`${data.total} bài viết`}
        action={
          <LinkButton href="/posts/new" size="sm">
            <Plus className="h-4 w-4" /> Thêm bài viết
          </LinkButton>
        }
      />

      <SearchInput placeholder="Tìm theo tiêu đề…" />

      {data.items.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title={search ? 'Không tìm thấy bài viết' : 'Chưa có bài viết nào'}
          description={search ? 'Thử từ khoá khác.' : 'Tạo bài viết đầu tiên để đăng lên website.'}
          action={
            !search && (
              <LinkButton href="/posts/new" size="sm">
                <Plus className="h-4 w-4" /> Thêm bài viết
              </LinkButton>
            )
          }
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH className="w-16">Ảnh</TH>
                <TH>Tiêu đề</TH>
                <TH>Trạng thái</TH>
                <TH>Cập nhật</TH>
                <TH className="text-right">Thao tác</TH>
              </TR>
            </THead>
            <tbody>
              {data.items.map((post) => (
                <TR key={post.id}>
                  <TD>
                    <div className="relative h-10 w-14 overflow-hidden rounded-md border bg-muted">
                      {post.thumbnail && (
                        <Image src={post.thumbnail} alt="" fill className="object-cover" sizes="56px" unoptimized />
                      )}
                    </div>
                  </TD>
                  <TD>
                    <Link href={`/posts/${post.id}`} className="font-medium text-fg hover:text-brand hover:underline">
                      {post.title}
                    </Link>
                    <div className="text-xs text-muted-fg">/{post.slug}</div>
                  </TD>
                  <TD>
                    <ContentStatusBadge status={post.status} />
                  </TD>
                  <TD className="whitespace-nowrap text-muted-fg">{formatDate(post.updatedAt)}</TD>
                  <TD>
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/posts/${post.id}`}>
                        <Button variant="ghost" size="icon" aria-label="Sửa">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeletePostButton id={post.id} slug={post.slug} title={post.title} compact />
                    </div>
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>

          <Pagination page={data.page} totalPages={data.totalPages} pathname="/posts" params={{ search }} />
        </>
      )}
    </>
  );
}
