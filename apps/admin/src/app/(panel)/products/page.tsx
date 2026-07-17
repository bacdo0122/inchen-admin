import Link from 'next/link';
import Image from 'next/image';
import { Package, Pencil, Plus } from 'lucide-react';
import type { Paginated } from '@inchem/shared';
import { PRODUCT_GROUP_LABEL } from '@inchem/shared';
import { apiFetch } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { LinkButton, Button } from '@/components/ui/button';
import { Table, THead, TR, TH, TD } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchInput, SelectFilter } from '@/components/shared/table-filters';
import { DeleteProductButton } from '@/components/products/delete-product-button';
import { VisibilityToggle } from '@/components/products/visibility-toggle';
import type { Product } from '@/lib/types';

export const metadata = { title: 'Sản phẩm' };

const groupOptions = Object.entries(PRODUCT_GROUP_LABEL).map(([value, label]) => ({ value, label }));

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; group?: string; page?: string }>;
}) {
  const { search, group, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const sp = new URLSearchParams({ page: String(page), pageSize: '12' });
  if (search) sp.set('search', search);
  if (group) sp.set('group', group);
  const data = await apiFetch<Paginated<Product>>(`/products/admin/all?${sp.toString()}`);

  return (
    <>
      <PageHeader
        title="Sản phẩm"
        description={`${data.total} sản phẩm`}
        action={
          <LinkButton href="/products/new" size="sm">
            <Plus className="h-4 w-4" /> Thêm sản phẩm
          </LinkButton>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Tìm theo tên…" />
        <SelectFilter paramKey="group" options={groupOptions} allLabel="Tất cả nhóm" />
      </div>

      {data.items.length === 0 ? (
        <EmptyState
          icon={Package}
          title={search || group ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
          description={search || group ? 'Thử bộ lọc khác.' : 'Thêm dòng sơn đầu tiên.'}
          action={
            !search &&
            !group && (
              <LinkButton href="/products/new" size="sm">
                <Plus className="h-4 w-4" /> Thêm sản phẩm
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
                <TH>Tên</TH>
                <TH>Nhóm</TH>
                <TH>Độ bóng</TH>
                <TH>Hiển thị</TH>
                <TH className="text-right">Thao tác</TH>
              </TR>
            </THead>
            <tbody>
              {data.items.map((p) => (
                <TR key={p.id}>
                  <TD>
                    <div className="relative h-11 w-11 overflow-hidden rounded-md border bg-muted">
                      {p.image && <Image src={p.image} alt="" fill className="object-cover" sizes="44px" unoptimized />}
                    </div>
                  </TD>
                  <TD>
                    <Link href={`/products/${p.id}`} className="font-medium text-fg hover:text-brand hover:underline">
                      {p.name}
                    </Link>
                    <div className="text-xs text-muted-fg">/{p.slug}</div>
                  </TD>
                  <TD className="whitespace-nowrap text-muted-fg">{PRODUCT_GROUP_LABEL[p.group]}</TD>
                  <TD className="text-muted-fg">{p.gloss || '—'}</TD>
                  <TD>
                    <VisibilityToggle id={p.id} status={p.status} />
                  </TD>
                  <TD>
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/products/${p.id}`}>
                        <Button variant="ghost" size="icon" aria-label="Sửa">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} compact />
                    </div>
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>

          <Pagination page={data.page} totalPages={data.totalPages} pathname="/products" params={{ search, group }} />
        </>
      )}
    </>
  );
}
