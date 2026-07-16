import Link from 'next/link';
import { Eye, Phone } from 'lucide-react';
import type { Paginated } from '@inchem/shared';
import { apiFetch } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { LEAD_STATUS_META } from '@/lib/constants';
import { PageHeader } from '@/components/ui/page-header';
import { Table, THead, TR, TH, TD } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { SelectFilter } from '@/components/shared/table-filters';
import { LeadStatusControl } from '@/components/leads/lead-status-control';
import { DeleteLeadButton } from '@/components/leads/delete-lead-button';
import type { Lead } from '@/lib/types';

export const metadata = { title: 'Yêu cầu báo giá' };

const statusOptions = Object.entries(LEAD_STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const sp = new URLSearchParams({ page: String(page), pageSize: '12' });
  if (status) sp.set('status', status);
  const data = await apiFetch<Paginated<Lead>>(`/leads?${sp.toString()}`);

  return (
    <>
      <PageHeader
        title="Yêu cầu báo giá"
        description={`${data.total} yêu cầu · dữ liệu khách hàng quan trọng nhất`}
      />

      <div className="flex flex-wrap items-center gap-3">
        <SelectFilter paramKey="status" options={statusOptions} allLabel="Tất cả trạng thái" />
      </div>

      {data.items.length === 0 ? (
        <EmptyState
          icon={Phone}
          title="Chưa có yêu cầu nào"
          description="Yêu cầu tư vấn/báo giá khách gửi từ website sẽ xuất hiện tại đây."
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Khách hàng</TH>
                <TH>Liên hệ</TH>
                <TH>Nội dung</TH>
                <TH>Ngày gửi</TH>
                <TH>Trạng thái</TH>
                <TH className="text-right">Thao tác</TH>
              </TR>
            </THead>
            <tbody>
              {data.items.map((lead) => (
                <TR key={lead.id}>
                  <TD>
                    <Link href={`/leads/${lead.id}`} className="font-medium text-fg hover:text-brand hover:underline">
                      {lead.fullName}
                    </Link>
                    {lead.email && <div className="text-xs text-muted-fg">{lead.email}</div>}
                  </TD>
                  <TD>
                    <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1 text-brand hover:underline">
                      <Phone className="h-3.5 w-3.5" /> {lead.phone}
                    </a>
                  </TD>
                  <TD className="max-w-xs">
                    <p className="line-clamp-2 text-muted-fg">{lead.message || '—'}</p>
                  </TD>
                  <TD className="whitespace-nowrap text-muted-fg">{formatDateTime(lead.createdAt)}</TD>
                  <TD>
                    <LeadStatusControl id={lead.id} status={lead.status} className="h-8 py-0 text-xs" />
                  </TD>
                  <TD>
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/leads/${lead.id}`}>
                        <Button variant="ghost" size="icon" aria-label="Xem chi tiết">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteLeadButton id={lead.id} name={lead.fullName} compact />
                    </div>
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            pathname="/leads"
            params={{ status }}
          />
        </>
      )}
    </>
  );
}
