import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Mail, MapPin, Phone, User } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardBody } from '@/components/ui/card';
import { LeadStatusControl } from '@/components/leads/lead-status-control';
import { DeleteLeadButton } from '@/components/leads/delete-lead-button';
import type { Lead } from '@/lib/types';

export const metadata = { title: 'Chi tiết yêu cầu' };

async function getLead(id: string): Promise<Lead> {
  try {
    return await apiFetch<Lead>(`/leads/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

function Row({ icon: Icon, label, children }: { icon: typeof User; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-fg" />
      <div className="min-w-0">
        <p className="text-xs text-muted-fg">{label}</p>
        <div className="text-sm text-fg">{children}</div>
      </div>
    </div>
  );
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLead(id);

  return (
    <>
      <Link href="/leads" className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Danh sách yêu cầu
      </Link>

      <PageHeader
        title={lead.fullName}
        description={`Gửi lúc ${formatDateTime(lead.createdAt)}`}
        action={<DeleteLeadButton id={lead.id} name={lead.fullName} redirectTo="/leads" />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardBody className="divide-y">
            <Row icon={User} label="Họ tên">
              {lead.fullName}
            </Row>
            <Row icon={Phone} label="Số điện thoại">
              <a href={`tel:${lead.phone}`} className="text-brand hover:underline">
                {lead.phone}
              </a>
            </Row>
            <Row icon={Mail} label="Email">
              {lead.email ? (
                <a href={`mailto:${lead.email}`} className="text-brand hover:underline">
                  {lead.email}
                </a>
              ) : (
                '—'
              )}
            </Row>
            <Row icon={MapPin} label="Địa chỉ">
              {lead.address || '—'}
            </Row>
            <Row icon={Calendar} label="Nội dung yêu cầu">
              <p className="whitespace-pre-wrap">{lead.message || '—'}</p>
            </Row>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-3">
              <p className="text-sm font-medium text-fg">Trạng thái xử lý</p>
              <LeadStatusControl id={lead.id} status={lead.status} className="w-full" />
              <p className="text-xs text-muted-fg">
                Cập nhật trạng thái để theo dõi tiến độ chăm sóc khách hàng.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-2">
              <p className="text-sm font-medium text-fg">Liên hệ nhanh</p>
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
              >
                <Phone className="h-4 w-4 text-brand" /> Gọi {lead.phone}
              </a>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
