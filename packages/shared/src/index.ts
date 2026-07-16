/**
 * Types & hằng số dùng chung giữa web, admin và api.
 * Giữ đồng bộ với enum trong apps/api/prisma/schema.prisma.
 */

export const PRODUCT_GROUP = {
  PU_INDOOR: 'PU_INDOOR',
  PU_OUTDOOR: 'PU_OUTDOOR',
  NC: 'NC',
  UV: 'UV',
  OTHER: 'OTHER',
} as const;
export type ProductGroup = (typeof PRODUCT_GROUP)[keyof typeof PRODUCT_GROUP];

export const PRODUCT_GROUP_LABEL: Record<ProductGroup, string> = {
  PU_INDOOR: 'Sơn PU trong nhà',
  PU_OUTDOOR: 'Sơn PU ngoài trời',
  NC: 'Sơn NC',
  UV: 'Sơn UV',
  OTHER: 'Sản phẩm khác',
};

export const CONTENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;
export type ContentStatus = (typeof CONTENT_STATUS)[keyof typeof CONTENT_STATUS];

export const COLOR_TONE = {
  WARM: 'WARM',
  LIGHT: 'LIGHT',
  DARK: 'DARK',
  COOL: 'COOL',
} as const;
export type ColorTone = (typeof COLOR_TONE)[keyof typeof COLOR_TONE];

export const COLOR_TONE_LABEL: Record<ColorTone, string> = {
  WARM: 'Tông ấm',
  LIGHT: 'Tông sáng',
  DARK: 'Tông tối',
  COOL: 'Tông lạnh',
};

export const LEAD_STATUS = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;
export type LeadStatus = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS];

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Thông tin công ty cố định (dùng cho footer/liên hệ). */
export const COMPANY = {
  name: 'CÔNG TY TNHH DỊCH VỤ THƯƠNG MẠI VÀ SẢN XUẤT MINH HIỀN',
  shortName: 'Minh Hiền - Inchem',
  taxCode: '0104117242',
  email: 'hienminh2011@gmail.com',
  hotline: ['093.642.8226', '0777.379.998'],
  zalo: '093.642.8226',
  address:
    'Lô CN-09-02, Cụm Công nghiệp Ninh Hiệp, xã Phù Đổng, TP Hà Nội',
  facebook: 'https://www.facebook.com/songoinchem',
  youtube: 'https://www.youtube.com/@MinhHiềnInchem',
  tiktok: 'https://vt.tiktok.com/ZSCWKYcLs/',
  map: 'https://maps.app.goo.gl/KCRpcb2CiZhrDZMQA',
  stores: [
    {
      name: 'Cửa hàng 1',
      address: 'Số 72A Tổ 26, phường Hoàng Mai, TP Hà Nội (gần gầm cầu chui Tam Trinh)',
      phone: '0903.232.716',
    },
    {
      name: 'Cửa hàng 2',
      address: 'BTSL01-09, khu đô thị Tân Tây Đô, xã Ô Diên, TP Hà Nội',
      phone: '0903.253.226',
    },
    {
      name: 'Cửa hàng 3',
      address: 'Số 173, Đường 419, Thôn Đồng Cam, xã Thạch Thất, TP Hà Nội',
      phone: '0902.299.683',
    },
  ],
} as const;
