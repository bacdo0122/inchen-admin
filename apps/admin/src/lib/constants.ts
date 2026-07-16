import {
  Image as ImageIcon,
  LayoutDashboard,
  Newspaper,
  Package,
  Send,
  type LucideIcon,
} from 'lucide-react';
import {
  COLOR_TONE_LABEL,
  CONTENT_STATUS,
  LEAD_STATUS,
  PRODUCT_GROUP_LABEL,
  type ContentStatus,
  type LeadStatus,
} from '@inchem/shared';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Hiển thị badge số lead mới cạnh mục này. */
  badge?: 'leads';
}

/** Thứ tự ưu tiên nghiệp vụ: Lead nằm ngay sau Dashboard. */
export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/leads', label: 'Yêu cầu báo giá', icon: Send, badge: 'leads' },
  { href: '/posts', label: 'Tin tức', icon: Newspaper },
  { href: '/products', label: 'Sản phẩm', icon: Package },
  { href: '/colors', label: 'Bảng màu', icon: ImageIcon },
];

/** Nhãn + màu badge trạng thái lead (nhất quán toàn admin). */
export const LEAD_STATUS_META: Record<LeadStatus, { label: string; tone: BadgeTone }> = {
  [LEAD_STATUS.NEW]: { label: 'Mới', tone: 'danger' },
  [LEAD_STATUS.IN_PROGRESS]: { label: 'Đã liên hệ', tone: 'warning' },
  [LEAD_STATUS.DONE]: { label: 'Đã chốt', tone: 'success' },
};

export const CONTENT_STATUS_META: Record<ContentStatus, { label: string; tone: BadgeTone }> = {
  [CONTENT_STATUS.DRAFT]: { label: 'Nháp', tone: 'neutral' },
  [CONTENT_STATUS.PUBLISHED]: { label: 'Đã xuất bản', tone: 'success' },
};

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'brand';

export { PRODUCT_GROUP_LABEL, COLOR_TONE_LABEL };
