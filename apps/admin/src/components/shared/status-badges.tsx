import type { ContentStatus, LeadStatus } from '@inchem/shared';
import { Badge } from '@/components/ui/badge';
import { CONTENT_STATUS_META, LEAD_STATUS_META } from '@/lib/constants';

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const meta = LEAD_STATUS_META[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  const meta = CONTENT_STATUS_META[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
