import Link from 'next/link';
import { ArrowRight, ImageIcon, Newspaper, Package, Plus, Send } from 'lucide-react';
import type { Paginated } from '@inchem/shared';
import { apiFetch } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { LinkButton } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LeadStatusBadge } from '@/components/shared/status-badges';
import type { Color, Lead, Post, Product } from '@/lib/types';

export const metadata = { title: 'Tổng quan' };

async function getData() {
  const [countNew, recentLeads, posts, products, colors] = await Promise.all([
    apiFetch<{ count: number }>('/leads/count-new'),
    apiFetch<Paginated<Lead>>('/leads?pageSize=5'),
    apiFetch<Paginated<Post>>('/posts/admin/all?pageSize=1'),
    apiFetch<Paginated<Product>>('/products/admin/all?pageSize=1'),
    apiFetch<Color[]>('/colors'),
  ]);
  return {
    newLeads: countNew.count,
    recentLeads: recentLeads.items,
    totalPosts: posts.total,
    totalProducts: products.total,
    totalColors: colors.length,
  };
}

function StatCard({
  href,
  icon: Icon,
  label,
  value,
  highlight,
}: {
  href: string;
  icon: typeof Send;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Link href={href} className="group">
      <Card
        className={
          highlight
            ? 'border-red-200 bg-red-50/60 transition-colors group-hover:border-red-300'
            : 'transition-colors group-hover:border-brand/40'
        }
      >
        <CardBody className="flex items-center gap-4">
          <div
            className={
              highlight
                ? 'flex h-11 w-11 items-center justify-center rounded-lg bg-red-600 text-white'
                : 'flex h-11 w-11 items-center justify-center rounded-lg bg-brand-muted text-brand'
            }
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold text-fg">{value}</p>
            <p className="truncate text-sm text-muted-fg">{label}</p>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

export default async function DashboardPage() {
  const data = await getData();

  return (
    <>
      <PageHeader
        title="Tổng quan"
        description="Theo dõi khách hàng và nội dung website."
        action={
          <>
            <LinkButton href="/posts/new" variant="outline" size="sm">
              <Plus className="h-4 w-4" /> Tin tức
            </LinkButton>
            <LinkButton href="/products/new" size="sm">
              <Plus className="h-4 w-4" /> Sản phẩm
            </LinkButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard href="/leads?status=NEW" icon={Send} label="Yêu cầu mới" value={data.newLeads} highlight />
        <StatCard href="/posts" icon={Newspaper} label="Bài tin tức" value={data.totalPosts} />
        <StatCard href="/products" icon={Package} label="Sản phẩm" value={data.totalProducts} />
        <StatCard href="/colors" icon={ImageIcon} label="Mẫu màu" value={data.totalColors} />
      </div>

      <Card>
        <div className="flex items-center justify-between border-b px-5 py-3.5">
          <h2 className="text-base font-semibold text-fg">Yêu cầu báo giá gần đây</h2>
          <Link href="/leads" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {data.recentLeads.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Chưa có yêu cầu nào" description="Khi khách gửi form trên website, yêu cầu sẽ hiện ở đây." />
          </div>
        ) : (
          <ul className="divide-y">
            {data.recentLeads.map((lead) => (
              <li key={lead.id}>
                <Link href={`/leads/${lead.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-fg">{lead.fullName}</p>
                    <p className="truncate text-sm text-muted-fg">
                      {lead.phone}
                      {lead.message ? ` · ${lead.message}` : ''}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right text-xs text-muted-fg sm:block">
                    {formatDateTime(lead.createdAt)}
                  </div>
                  <LeadStatusBadge status={lead.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
